import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from '../../lib/i18n';
import { useTelegram } from '../../lib/telegram/index';
import {
  useSubscriptionStore,
  useTransactionsStore,
  useUserStore,
  useUsageStore,
} from '../../lib/stores';
import { FREE_TIER_LIMITS, type PlanTier } from '../../lib/constants/freeTierLimits';
import SubscribeModal from '../../components/SubscribeModal';
import type { Variants } from 'framer-motion';

interface SubscriptionPlanCardProps {
  tier: PlanTier;
  title: string;
  accent: string;
  badge?: string;
  features: string[];
  currentTier: PlanTier;
  itemVariants: Variants;
  currentPlanLabel: string;
  subscribeBasicLabel: string;
  subscribeProLabel: string;
  onSubscribe: (tier: Exclude<PlanTier, 'free'>) => void;
}

function SubscriptionPlanCard({
  tier,
  title,
  accent,
  badge,
  features,
  currentTier,
  itemVariants,
  currentPlanLabel,
  subscribeBasicLabel,
  subscribeProLabel,
  onSubscribe,
}: SubscriptionPlanCardProps) {
  const isCurrent = currentTier === tier;
  return (
    <motion.div
      variants={itemVariants}
      className={`relative rounded-2xl border-2 bg-white dark:bg-gray-900 p-5 ${
        isCurrent ? `border-${accent}` : 'border-gray-100 dark:border-gray-800'
      }`}
      style={
        isCurrent
          ? { borderColor: accent.startsWith('#') ? accent : undefined }
          : undefined
      }
    >
      {badge && (
        <div
          className="absolute -top-2 right-4 rounded-full px-3 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white"
          style={{ background: accent }}
        >
          {badge}
        </div>
      )}
      <div className="mb-3 flex items-baseline justify-between">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white">{title}</h3>
        {isCurrent && (
          <span className="text-xs font-bold uppercase text-primary">
            {currentPlanLabel}
          </span>
        )}
      </div>
      <ul className="space-y-2">
        {features.map((feature) => (
          <li key={feature} className="flex items-start gap-2 text-sm">
            <span
              className="material-symbols-outlined text-base"
              style={{
                fontVariationSettings: "'FILL' 1",
                color: accent,
              }}
            >
              check_circle
            </span>
            <span className="text-gray-700 dark:text-gray-300">{feature}</span>
          </li>
        ))}
      </ul>
      {tier !== 'free' && !isCurrent && (
        <button
          type="button"
          onClick={() => onSubscribe(tier)}
          className="mt-5 w-full rounded-xl py-3 font-bold text-white shadow-lg"
          style={{ background: accent, boxShadow: `0 8px 20px -8px ${accent}` }}
        >
          {tier === 'basic' ? subscribeBasicLabel : subscribeProLabel}
        </button>
      )}
    </motion.div>
  );
}

const Subscription = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { haptic, webApp } = useTelegram();

  const user = useUserStore((s) => s.user);
  const refreshAccount = useUserStore((s) => s.refreshAccount);
  const {
    subscription,
    cancel,
    cancelStatus,
    getCurrentTier,
  } = useSubscriptionStore();
  const { transactions, fetchTransactions } = useTransactionsStore();
  const remainingNewWords = useUsageStore((s) => s.remainingNewWords);

  const [subscribeFor, setSubscribeFor] = useState<PlanTier | null>(null);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  useEffect(() => {
    fetchTransactions().catch(() => {
      // Transactions endpoint might 404 for fresh users — silent.
    });
  }, [fetchTransactions]);

  const currentTier = getCurrentTier();

  const planFeatures = {
    free: [
      t('subscription.freeFeatures.newWords', {
        count: FREE_TIER_LIMITS.NEW_WORDS_PER_DAY,
      }),
      t('subscription.freeFeatures.basicCourses'),
      t('subscription.freeFeatures.simpleGames'),
      t('subscription.freeFeatures.ads'),
    ],
    basic: [
      t('subscription.basicFeatures.allGeneral'),
      t('subscription.basicFeatures.unlimitedWords'),
      t('subscription.basicFeatures.allGames'),
      t('subscription.basicFeatures.analytics'),
      t('subscription.basicFeatures.noAds'),
    ],
    pro: [
      t('subscription.proFeatures.everythingBasic'),
      t('subscription.proFeatures.ielts'),
      t('subscription.proFeatures.priority'),
    ],
  };

  const handleCancel = async () => {
    haptic.impact('medium');
    const ok = await cancel();
    if (ok) {
      haptic.notification('success');
      webApp?.showAlert(t('subscription.cancelled'));
    } else {
      haptic.notification('error');
    }
    setShowCancelConfirm(false);
  };

  const formatDate = (iso?: string) => {
    if (!iso) return '—';
    const d = new Date(iso);
    return d.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 16 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <div className="relative flex min-h-screen w-full flex-col max-w-[430px] mx-auto overflow-x-hidden bg-gray-50 dark:bg-background-dark">
      {/* Header */}
      <div className="sticky top-0 z-10 flex items-center bg-gray-50/80 dark:bg-background-dark/80 backdrop-blur-md p-4 justify-between">
        <button
          onClick={() => navigate(-1)}
          className="text-gray-800 dark:text-white flex size-10 shrink-0 items-center justify-center"
        >
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <h2 className="flex-1 text-center text-lg font-bold text-gray-800 dark:text-white">
          {t('subscription.title')}
        </h2>
        <div className="w-10" />
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="flex-1 pb-24"
      >
        {/* Current plan panel */}
        <motion.div variants={itemVariants} className="px-4 pt-4">
          <div className="rounded-2xl bg-gradient-to-br from-primary to-purple-600 p-5 text-white shadow-lg shadow-primary/20">
            <p className="text-xs uppercase tracking-wider opacity-80">
              {t('subscription.yourPlan')}
            </p>
            <p className="mt-1 text-2xl font-bold">
              {t(`subscription.${currentTier}`)}
            </p>
            {subscription && subscription.statusCode === 'ACTIVE' ? (
              <>
                <p className="mt-3 text-sm opacity-90">
                  {t('subscription.activeUntil', {
                    date: formatDate(subscription.expiredAt),
                  })}
                </p>
                <p className="text-xs opacity-70">
                  {t('subscription.paidWith', {
                    source: subscription.sourceCode,
                  })}
                </p>
                <button
                  onClick={() => setShowCancelConfirm(true)}
                  className="mt-4 rounded-lg border border-white/30 bg-white/10 px-4 py-2 text-sm font-medium backdrop-blur-sm"
                >
                  {t('subscription.cancel')}
                </button>
              </>
            ) : (
              <p className="mt-3 text-sm opacity-90">
                {t('usage.newWordsRemaining', {
                  remaining: remainingNewWords(),
                  limit: FREE_TIER_LIMITS.NEW_WORDS_PER_DAY,
                })}
              </p>
            )}
          </div>
          {subStatus === 'loading' && (
            <p className="mt-2 text-xs text-gray-400">{t('common.loading')}</p>
          )}
        </motion.div>

        {/* Plan comparison */}
        <motion.div variants={itemVariants} className="px-4 pt-6">
          <h3 className="mb-3 text-base font-bold text-gray-900 dark:text-white">
            {t('subscription.chooseYourPlan')}
          </h3>
          <div className="space-y-3">
            <SubscriptionPlanCard
              tier="free"
              title={t('subscription.free')}
              accent="#9ca3af"
              features={planFeatures.free}
              currentTier={currentTier}
              itemVariants={itemVariants}
              currentPlanLabel={t('subscription.currentPlan')}
              subscribeBasicLabel={t('subscription.subscribeBasic')}
              subscribeProLabel={t('subscription.subscribePro')}
              onSubscribe={(tier) => {
                haptic.impact('light');
                setSubscribeFor(tier);
              }}
            />
            <SubscriptionPlanCard
              tier="basic"
              title={t('subscription.basic')}
              accent="#7c3aed"
              badge={t('subscription.mostPopular')}
              features={planFeatures.basic}
              currentTier={currentTier}
              itemVariants={itemVariants}
              currentPlanLabel={t('subscription.currentPlan')}
              subscribeBasicLabel={t('subscription.subscribeBasic')}
              subscribeProLabel={t('subscription.subscribePro')}
              onSubscribe={(tier) => {
                haptic.impact('light');
                setSubscribeFor(tier);
              }}
            />
            <SubscriptionPlanCard
              tier="pro"
              title={t('subscription.pro')}
              accent="#f59e0b"
              features={planFeatures.pro}
              currentTier={currentTier}
              itemVariants={itemVariants}
              currentPlanLabel={t('subscription.currentPlan')}
              subscribeBasicLabel={t('subscription.subscribeBasic')}
              subscribeProLabel={t('subscription.subscribePro')}
              onSubscribe={(tier) => {
                haptic.impact('light');
                setSubscribeFor(tier);
              }}
            />
          </div>
        </motion.div>

        {/* Transactions */}
        <motion.div variants={itemVariants} className="px-4 pt-8">
          <h3 className="mb-3 text-base font-bold text-gray-900 dark:text-white">
            {t('subscription.transactionHistory')}
          </h3>
          {transactions.length === 0 ? (
            <p className="rounded-xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-4 text-center text-sm text-gray-500">
              {t('subscription.noTransactions')}
            </p>
          ) : (
            <div className="space-y-2">
              {transactions.slice(0, 5).map((tx) => (
                <div
                  key={tx.uid}
                  className="flex items-center justify-between rounded-xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-3"
                >
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {tx.provider}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatDate(tx.completedAt ?? tx.createdAt ?? tx.updatedAt)} ·{' '}
                      {t(`subscription.txStatus.${tx.status}`)}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 text-amber-500">
                    <span
                      className="material-symbols-outlined text-base"
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      monetization_on
                    </span>
                    <span className="font-bold text-gray-900 dark:text-white">
                      {tx.coins?.toLocaleString() || 0}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        {user?.octoCoins !== undefined && (
          <motion.p
            variants={itemVariants}
            className="px-4 py-6 text-center text-xs text-gray-400"
          >
            Balance: {user.octoCoins.toLocaleString()} coins
          </motion.p>
        )}
      </motion.div>

      {/* Subscribe Modal */}
      {subscribeFor && (
        <SubscribeModal
          isOpen={!!subscribeFor}
          onClose={() => setSubscribeFor(null)}
          planLabel={t(`subscription.${subscribeFor}`)}
          onSuccess={() => {
            refreshAccount();
            fetchTransactions();
          }}
        />
      )}

      {/* Cancel confirm */}
      {showCancelConfirm && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
          onClick={() => setShowCancelConfirm(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-full max-w-sm rounded-2xl bg-white dark:bg-gray-800 p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="mb-2 text-xl font-bold text-gray-900 dark:text-white">
              {t('subscription.cancelConfirmTitle')}
            </h3>
            <p className="mb-6 text-sm text-gray-500 dark:text-gray-400">
              {t('subscription.cancelConfirmBody', {
                date: formatDate(subscription?.expiredAt),
              })}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowCancelConfirm(false)}
                className="flex-1 rounded-xl bg-gray-100 dark:bg-gray-700 px-4 py-3 font-medium text-gray-700 dark:text-gray-300"
              >
                {t('subscription.keepIt')}
              </button>
              <button
                onClick={handleCancel}
                disabled={cancelStatus === 'cancelling'}
                className="flex-1 rounded-xl bg-red-500 px-4 py-3 font-medium text-white disabled:opacity-50"
              >
                {cancelStatus === 'cancelling'
                  ? t('subscription.cancelling')
                  : t('subscription.cancel')}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default Subscription;
