import { useEffect, useState, type ReactNode } from 'react';

import { useTranslation } from '../../lib/i18n';
import { cn } from '../../lib/utils/cn';
import Button from '../ui/Button';
import Modal from '../ui/Modal';

/** Способы оплаты пакета монет в магазине (UI; дальше маппится на payment API). */
export type CoinCheckoutMethod = 'telegram_stars' | 'payme_uz' | 'click_uz';

const METHODS: CoinCheckoutMethod[] = ['telegram_stars', 'payme_uz', 'click_uz'];

export interface PaymentMethodModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** Доступен ли встроенный счёт Telegram (Mini App + openInvoice). */
  telegramInlineAvailable: boolean;
  /** Дополнительный блок под заголовком (например, название пакета). */
  summary?: ReactNode;
  isSubmitting?: boolean;
  onContinue: (method: CoinCheckoutMethod) => void;
}

const methodIcon: Record<CoinCheckoutMethod, string> = {
  telegram_stars: 'star',
  payme_uz: 'account_balance_wallet',
  click_uz: 'credit_card',
};

export const PaymentMethodModal = ({
  isOpen,
  onClose,
  telegramInlineAvailable,
  summary,
  isSubmitting = false,
  onContinue,
}: PaymentMethodModalProps) => {
  const { t } = useTranslation();
  const [method, setMethod] = useState<CoinCheckoutMethod>('telegram_stars');

  useEffect(() => {
    if (!isOpen) return;
    const id = requestAnimationFrame(() => {
      setMethod(telegramInlineAvailable ? 'telegram_stars' : 'payme_uz');
    });
    return () => cancelAnimationFrame(id);
  }, [isOpen, telegramInlineAvailable]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t('shop.paymentMethodTitle')}
      variant="bottom"
      className="dark:bg-background-dark"
    >
      <div className="max-h-[70vh] overflow-y-auto p-4 pb-8">
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
          {t('shop.paymentMethodSubtitle')}
        </p>
        {summary ? <div className="mb-4 rounded-xl bg-gray-50 dark:bg-white/5 p-3 text-sm">{summary}</div> : null}

        <div
          role="radiogroup"
          aria-label={t('shop.paymentMethodGroupAria')}
          className="space-y-2"
        >
          {METHODS.map((id) => {
            const starsDisabled = id === 'telegram_stars' && !telegramInlineAvailable;
            const selected = method === id;
            return (
              <button
                key={id}
                type="button"
                role="radio"
                aria-checked={selected}
                aria-disabled={starsDisabled}
                disabled={starsDisabled || isSubmitting}
                onClick={() => {
                  if (starsDisabled) return;
                  setMethod(id);
                }}
                className={cn(
                  'flex w-full items-center gap-3 rounded-xl border-2 p-4 text-left transition-all',
                  selected && !starsDisabled
                    ? 'border-primary bg-primary/5 dark:bg-primary/10'
                    : 'border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900',
                  starsDisabled && 'opacity-45 cursor-not-allowed',
                )}
              >
                <span
                  className={cn(
                    'flex size-11 shrink-0 items-center justify-center rounded-xl',
                    id === 'telegram_stars' && 'bg-amber-100 dark:bg-amber-900/30 text-amber-600',
                    id === 'payme_uz' && 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700',
                    id === 'click_uz' && 'bg-sky-100 dark:bg-sky-900/30 text-sky-700',
                  )}
                >
                  <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                    {methodIcon[id]}
                  </span>
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-semibold text-gray-900 dark:text-white">
                    {id === 'telegram_stars' && t('shop.methodTelegramStars')}
                    {id === 'payme_uz' && t('shop.methodPaymeUz')}
                    {id === 'click_uz' && t('shop.methodClickUz')}
                  </span>
                  {id === 'telegram_stars' && (
                    <span className="mt-0.5 block text-xs text-gray-500 dark:text-gray-400">
                      {telegramInlineAvailable
                        ? t('shop.methodTelegramStarsHintOk')
                        : t('shop.methodTelegramStarsHintDisabled')}
                    </span>
                  )}
                </span>
                <span
                  className={cn(
                    'flex size-5 shrink-0 items-center justify-center rounded-full border-2',
                    selected ? 'border-primary bg-primary' : 'border-gray-300 dark:border-gray-600',
                  )}
                >
                  {selected ? <span className="size-2 rounded-full bg-white" /> : null}
                </span>
              </button>
            );
          })}
        </div>

        <Button
          type="button"
          variant="primary"
          fullWidth
          className="mt-6"
          disabled={isSubmitting}
          onClick={() => onContinue(method)}
        >
          {isSubmitting ? t('shop.paymentMethodSubmitting') : t('common.continue')}
        </Button>
      </div>
    </Modal>
  );
};
