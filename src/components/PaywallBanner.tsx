import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from '../lib/i18n';

export type PaywallVariant =
  | 'locked' // generic premium content
  | 'dailyLimit' // free user hit a daily counter
  | 'nextUnitLocked' // 24h cooldown after previous unit
  | 'proOnly'; // Pro-tier (e.g. IELTS) content for a Basic user

interface PaywallBannerProps {
  variant: PaywallVariant;
  /** For dailyLimit / nextUnitLocked — milliseconds remaining until reset/unlock. */
  msRemaining?: number;
  /** Override CTA destination. Defaults to /subscription. */
  ctaTo?: string;
  className?: string;
}

const formatHM = (ms: number) => {
  const total = Math.max(0, Math.ceil(ms / 1000));
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  return { hours, minutes };
};

const PaywallBanner = ({
  variant,
  msRemaining,
  ctaTo = '/subscription',
  className = '',
}: PaywallBannerProps) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const titleKey = `paywall.${variant === 'dailyLimit' ? 'dailyLimit' : variant === 'nextUnitLocked' ? 'nextUnitLocked' : variant === 'proOnly' ? 'proOnly' : 'locked'}` as const;
  const descKey = `paywall.${variant === 'dailyLimit' ? 'dailyLimitDesc' : variant === 'nextUnitLocked' ? 'nextUnitLockedDesc' : variant === 'proOnly' ? 'proOnlyDesc' : 'lockedDesc'}` as const;

  const params =
    msRemaining !== undefined ? formatHM(msRemaining) : { hours: 0, minutes: 0 };

  const icon =
    variant === 'dailyLimit'
      ? 'hourglass_top'
      : variant === 'nextUnitLocked'
        ? 'schedule'
        : variant === 'proOnly'
          ? 'workspace_premium'
          : 'lock';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`mx-4 my-4 rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/10 to-purple-500/10 p-5 ${className}`}
    >
      <div className="flex items-start gap-3">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/20">
          <span
            className="material-symbols-outlined text-primary"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            {icon}
          </span>
        </div>
        <div className="flex-1">
          <h4 className="text-base font-bold text-gray-900 dark:text-white">
            {t(titleKey)}
          </h4>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            {t(descKey, params)}
          </p>
        </div>
      </div>
      <button
        onClick={() => navigate(ctaTo)}
        className="mt-4 w-full rounded-xl bg-primary py-3 text-sm font-bold text-white shadow-lg shadow-primary/20 active:scale-[0.98] transition-transform"
      >
        {t('paywall.upgrade')}
      </button>
    </motion.div>
  );
};

export default PaywallBanner;
