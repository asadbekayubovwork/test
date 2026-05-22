import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Modal from './ui/Modal';
import { useTranslation } from '../lib/i18n';
import { useTelegram } from '../lib/telegram/index';
import {
  createTelegramInvoice,
  confirmTelegramPayment,
} from '../lib/api/telegramPayment';
import { getPrices, type PackageResponse } from '../lib/api/pricing';
import { useSubscriptionStore, useUserStore } from '../lib/stores';

interface SubscribeModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** Display title for the plan being purchased (Basic / Pro). */
  planLabel: string;
  /**
   * Optional pre-selected package id. When omitted the modal lists all
   * available packages and lets the user pick one — the actual mapping
   * between package and plan tier is pending team confirmation.
   */
  defaultPackageId?: string;
  onSuccess?: () => void;
}

type Step =
  | 'choose'
  | 'creating'
  | 'awaiting'
  | 'confirming'
  | 'polling'
  | 'success'
  | 'error';

const POLL_INTERVAL_MS = 2500;
const MAX_POLLS = 24; // ~1 min of polling before giving up

const SubscribeModal = ({
  isOpen,
  onClose,
  planLabel,
  defaultPackageId,
  onSuccess,
}: SubscribeModalProps) => {
  const { t } = useTranslation();
  const { webApp, haptic } = useTelegram();
  const refreshAccount = useUserStore((s) => s.refreshAccount);

  const [step, setStep] = useState<Step>('choose');
  const [packages, setPackages] = useState<PackageResponse[]>([]);
  const [selectedPackageId, setSelectedPackageId] = useState<string | null>(
    defaultPackageId ?? null,
  );
  const [error, setError] = useState<string | null>(null);
  const [coinsAdded, setCoinsAdded] = useState(0);
  const pollTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopPolling = useCallback(() => {
    if (pollTimerRef.current) {
      clearInterval(pollTimerRef.current);
      pollTimerRef.current = null;
    }
  }, []);

  // Cleanup on unmount.
  useEffect(() => () => stopPolling(), [stopPolling]);

  // Load prices when the sheet is open (component is usually remounted each open).
  useEffect(() => {
    if (!isOpen || packages.length > 0) return;
    getPrices()
      .then((res) => setPackages(res.packages || []))
      .catch((err) => {
        setError(err instanceof Error ? err.message : 'Failed to load packages');
        setStep('error');
      });
  }, [isOpen, packages.length]);

  const startPolling = useCallback(() => {
    let count = 0;
    setStep('polling');
    pollTimerRef.current = setInterval(async () => {
      count += 1;
      await refreshAccount();
      const sub = useSubscriptionStore.getState().subscription;
      if (sub && sub.statusCode === 'ACTIVE') {
        stopPolling();
        haptic.notification('success');
        setStep('success');
        onSuccess?.();
        return;
      }
      if (count >= MAX_POLLS) {
        stopPolling();
        // Coins likely credited even if subscription auto-activation hasn't
        // landed yet. Treat as soft success and let user retry from the page.
        setStep('success');
        onSuccess?.();
      }
    }, POLL_INTERVAL_MS);
  }, [refreshAccount, haptic, stopPolling, onSuccess]);

  const startPurchase = useCallback(
    async (pkg: PackageResponse) => {
      if (!webApp) {
        setError('Telegram WebApp not available');
        setStep('error');
        return;
      }
      setError(null);
      setStep('creating');
      try {
        const invoice = await createTelegramInvoice({
          packageId: pkg.packageId,
          idempotencyKey: `${pkg.packageId}-${Date.now()}`,
        });
        setStep('awaiting');
        webApp.openInvoice(invoice.invoiceUrl, async (status) => {
          if (status === 'paid') {
            setStep('confirming');
            try {
              const result = await confirmTelegramPayment({
                transactionUid: invoice.transactionUid,
              });
              setCoinsAdded(result.coinsAdded || 0);
              startPolling();
            } catch (err) {
              setError(
                err instanceof Error ? err.message : 'Confirmation failed',
              );
              setStep('error');
            }
          } else if (status === 'cancelled') {
            setStep('choose');
          } else {
            setError(`Payment ${status}`);
            setStep('error');
          }
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to create invoice');
        setStep('error');
      }
    },
    [webApp, startPolling],
  );

  const handleConfirmChoice = () => {
    const pkg = packages.find((p) => p.packageId === selectedPackageId);
    if (!pkg) return;
    haptic.impact('medium');
    startPurchase(pkg);
  };

  const renderChoose = () => (
    <div className="space-y-3">
      {packages.length === 0 ? (
        <div className="py-8 text-center">
          <span className="material-symbols-outlined animate-spin text-2xl text-gray-400">
            progress_activity
          </span>
        </div>
      ) : (
        packages.map((pkg) => {
          const selected = pkg.packageId === selectedPackageId;
          return (
            <button
              key={pkg.packageId}
              onClick={() => setSelectedPackageId(pkg.packageId)}
              className={`flex w-full items-center justify-between rounded-xl border-2 p-4 transition-all ${
                selected
                  ? 'border-primary bg-primary/5'
                  : 'border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900'
              }`}
            >
              <div className="text-left">
                <p className="font-bold text-gray-900 dark:text-white">
                  {pkg.name}
                </p>
                <p className="text-xs text-gray-500">
                  {pkg.coin.toLocaleString()} coins
                </p>
              </div>
              <div className="flex items-center gap-1">
                <span className="material-symbols-outlined text-amber-500 text-base">
                  star
                </span>
                <span className="font-bold text-gray-900 dark:text-white">
                  {pkg.priceStars}
                </span>
              </div>
            </button>
          );
        })
      )}
      <button
        onClick={handleConfirmChoice}
        disabled={!selectedPackageId}
        className="mt-4 w-full rounded-xl bg-primary py-3.5 font-bold text-white disabled:opacity-50"
      >
        {t('subscription.purchase.payWithStars')}
      </button>
    </div>
  );

  const renderStatus = (icon: string, text: string, animate = false) => (
    <div className="py-8 text-center">
      <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-primary/10">
        <span
          className={`material-symbols-outlined text-3xl text-primary ${animate ? 'animate-spin' : ''}`}
        >
          {icon}
        </span>
      </div>
      <p className="text-base font-medium text-gray-700 dark:text-gray-300">
        {text}
      </p>
    </div>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`${t('subscription.subscribeBasic').replace('Basic', planLabel)}`}
      variant="bottom"
      className="dark:bg-background-dark"
    >
      <div className="p-4 pb-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            {step === 'choose' && renderChoose()}
            {step === 'creating' &&
              renderStatus(
                'progress_activity',
                t('subscription.purchase.stepCreating'),
                true,
              )}
            {step === 'awaiting' &&
              renderStatus(
                'hourglass_top',
                t('subscription.purchase.stepWaiting'),
              )}
            {step === 'confirming' &&
              renderStatus(
                'progress_activity',
                t('subscription.purchase.stepConfirming'),
                true,
              )}
            {step === 'polling' &&
              renderStatus(
                'progress_activity',
                t('subscription.purchase.stepPolling'),
                true,
              )}
            {step === 'success' && (
              <div className="py-8 text-center">
                <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
                  <span
                    className="material-symbols-outlined text-3xl text-green-500"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    check_circle
                  </span>
                </div>
                <p className="text-lg font-bold text-gray-900 dark:text-white">
                  {t('subscription.purchase.success')}
                </p>
                {coinsAdded > 0 && (
                  <p className="mt-1 text-sm text-gray-500">
                    {t('subscription.coinsAdded', { count: coinsAdded })}
                  </p>
                )}
                <button
                  onClick={onClose}
                  className="mt-6 w-full rounded-xl bg-primary py-3 font-bold text-white"
                >
                  {t('common.done')}
                </button>
              </div>
            )}
            {step === 'error' && (
              <div className="py-8 text-center">
                <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
                  <span className="material-symbols-outlined text-3xl text-red-500">
                    error
                  </span>
                </div>
                <p className="text-lg font-bold text-gray-900 dark:text-white">
                  {t('subscription.purchase.error')}
                </p>
                {error && (
                  <p className="mt-2 text-sm text-gray-500">{error}</p>
                )}
                <button
                  onClick={() => setStep('choose')}
                  className="mt-6 w-full rounded-xl bg-primary py-3 font-bold text-white"
                >
                  {t('subscription.purchase.tryAgain')}
                </button>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </Modal>
  );
};

export default SubscribeModal;
