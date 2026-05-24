import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { PaymentMethodModal, type CoinCheckoutMethod } from '../../components/payment';
import { useTranslation } from '../../lib/i18n';
import type { TranslationKey } from '../../lib/i18n';
import { useTelegram } from '../../lib/telegram/index';
import { isAuthenticated } from '../../lib/api/client';
import {
  createTelegramInvoice,
  confirmTelegramPayment,
} from '../../lib/api/telegramPayment';
import { getShopSubscriptions } from '../../lib/api/shop';
import type {
  ShopSubscriptionOffer,
  SubscriptionsResponse,
} from '../../lib/api/shop';
import type { PaymentSubscriptionCode } from '../../lib/api/paymentClient';
import {
  useUserStore,
  useSubscriptionStore,
  useTransactionsStore,
} from '../../lib/stores';
import './Shop.css';

type ShopTab = 'plans' | 'history';
type LoadStatus = 'idle' | 'loading' | 'success' | 'error';

const fmtNum = (n: number) =>
  String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');

const PLAN_CODES: PaymentSubscriptionCode[] = ['BASIC', 'PRO'];

const Shop = () => {
  const { t, language } = useTranslation();
  const navigate = useNavigate();
  const { haptic, webApp } = useTelegram();

  const refreshAccount = useUserStore((s) => s.refreshAccount);
  const { subscription, getCurrentTier } = useSubscriptionStore();
  const {
    transactions,
    status: txStatus,
    error: txError,
    fetchTransactions,
  } = useTransactionsStore();

  const auth = isAuthenticated();
  const currentTier = getCurrentTier();

  const [tab, setTab] = useState<ShopTab>('plans');
  const [period, setPeriod] = useState<number | null>(null);
  const [selectedPlan, setSelectedPlan] =
    useState<PaymentSubscriptionCode | null>(null);

  const [subOffersStatus, setSubOffersStatus] = useState<LoadStatus>('idle');
  const [subOffersData, setSubOffersData] = useState<SubscriptionsResponse | null>(
    null,
  );
  const [subOffersError, setSubOffersError] = useState<string | null>(null);

  const [checkoutTarget, setCheckoutTarget] =
    useState<ShopSubscriptionOffer | null>(null);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [checkoutSubmitting, setCheckoutSubmitting] = useState(false);

  useEffect(() => {
    if (auth) void refreshAccount();
  }, [auth, refreshAccount]);

  const loadShopSubscriptions = useCallback(async () => {
    setSubOffersStatus('loading');
    setSubOffersError(null);
    try {
      const data = await getShopSubscriptions();
      setSubOffersData(data);
      setSubOffersStatus('success');
    } catch (e) {
      setSubOffersStatus('error');
      setSubOffersError(
        e instanceof Error ? e.message : t('shop.loadSubscriptionsError'),
      );
    }
  }, [t]);

  useEffect(() => {
    if (!auth) return;
    if (tab !== 'plans') return;
    if (subOffersStatus !== 'idle') return;
    const id = requestAnimationFrame(() => {
      void loadShopSubscriptions();
    });
    return () => cancelAnimationFrame(id);
  }, [auth, tab, subOffersStatus, loadShopSubscriptions]);

  useEffect(() => {
    if (!auth) return;
    if (tab !== 'history') return;
    void fetchTransactions();
  }, [auth, tab, fetchTransactions]);

  // Group offers by plan code and month
  const grouped = useMemo(() => {
    const map: Record<PaymentSubscriptionCode, Map<number, ShopSubscriptionOffer>> = {
      BASIC: new Map(),
      PRO: new Map(),
    };
    subOffersData?.subscriptions.forEach((o) => {
      if (map[o.code]) map[o.code].set(o.month, o);
    });
    return map;
  }, [subOffersData]);

  const availablePeriods = useMemo(() => {
    const set = new Set<number>();
    subOffersData?.subscriptions.forEach((o) => set.add(o.month));
    return Array.from(set).sort((a, b) => a - b);
  }, [subOffersData]);

  const bestPeriod = useMemo(() => {
    if (!availablePeriods.length) return null;
    return availablePeriods[availablePeriods.length - 1];
  }, [availablePeriods]);

  useEffect(() => {
    if (period !== null) return;
    if (availablePeriods.length === 0) return;
    setPeriod(availablePeriods[0]);
  }, [availablePeriods, period]);

  const getOffer = (code: PaymentSubscriptionCode): ShopSubscriptionOffer | null => {
    if (period === null) return null;
    return grouped[code].get(period) ?? null;
  };

  const computeSavePct = (
    code: PaymentSubscriptionCode,
    month: number,
  ): number | null => {
    const monthOne = grouped[code].get(1);
    const target = grouped[code].get(month);
    if (!monthOne || !target || month === 1) return null;
    const baseline = monthOne.priceUzs * month;
    if (!baseline) return null;
    const saved = baseline - target.priceUzs;
    if (saved <= 0) return null;
    return Math.round((saved / baseline) * 100);
  };

  const formatDate = (iso?: string | null): string => {
    if (!iso) return '—';
    const date = new Date(iso);
    const locale =
      language === 'ru'
        ? 'ru-RU'
        : language === 'uk'
          ? 'uk-UA'
          : language === 'kk'
            ? 'kk-KZ'
            : language === 'uz'
              ? 'uz-UZ'
              : 'en-GB';
    return new Intl.DateTimeFormat(locale, {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(date);
  };

  const onTab = (next: ShopTab) => {
    haptic.selection();
    setTab(next);
  };

  const onSelectPlan = (code: PaymentSubscriptionCode) => {
    haptic.selection();
    setSelectedPlan((prev) => (prev === code ? null : code));
  };

  const onSelectPeriod = (m: number) => {
    haptic.selection();
    setPeriod(m);
  };

  const openCheckout = (offer: ShopSubscriptionOffer) => {
    haptic.impact('medium');
    setCheckoutTarget(offer);
    setCheckoutOpen(true);
  };

  const onCtaClick = () => {
    if (!selectedPlan) return;
    const offer = getOffer(selectedPlan);
    if (!offer) return;
    openCheckout(offer);
  };

  const onTrialClick = () => {
    if (!selectedPlan) {
      const basic = getOffer('BASIC');
      if (basic) openCheckout(basic);
      return;
    }
    const offer = getOffer(selectedPlan);
    if (offer) openCheckout(offer);
  };

  const handleCheckoutContinue = async (chosen: CoinCheckoutMethod) => {
    const target = checkoutTarget;
    if (!target) return;

    const closeAndClear = () => {
      setCheckoutOpen(false);
      setCheckoutSubmitting(false);
      setCheckoutTarget(null);
    };

    const notify = (msg: string) => {
      if (webApp?.showAlert) webApp.showAlert(msg);
      else window.alert(msg);
    };

    if (chosen === 'payme_uz') {
      closeAndClear();
      notify(t('shop.paymeUzSoon'));
      return;
    }
    if (chosen === 'click_uz') {
      closeAndClear();
      notify(t('shop.clickUzSoon'));
      return;
    }
    if (!webApp) {
      notify(t('shop.starsNeedTelegram'));
      return;
    }

    setCheckoutSubmitting(true);
    try {
      const invoice = await createTelegramInvoice({
        packageId: target.packageId,
        idempotencyKey: `${target.packageId}-${Date.now()}`,
      });
      closeAndClear();
      webApp.openInvoice(invoice.invoiceUrl, async (status) => {
        if (status === 'paid') {
          try {
            await confirmTelegramPayment({
              transactionUid: invoice.transactionUid,
            });
            await refreshAccount();
            await fetchTransactions();
            haptic.notification('success');
            webApp.showAlert(t('shop.purchaseSuccess'));
          } catch (err) {
            haptic.notification('error');
            webApp.showAlert(
              err instanceof Error ? err.message : t('shop.purchaseError'),
            );
          }
        } else if (status !== 'cancelled') {
          webApp.showAlert(`${t('shop.purchaseError')} (${status})`);
        }
      });
    } catch (err) {
      setCheckoutSubmitting(false);
      haptic.notification('error');
      notify(err instanceof Error ? err.message : t('shop.purchaseError'));
    }
  };

  const selectedOffer = selectedPlan ? getOffer(selectedPlan) : null;
  const ctaLabel = selectedOffer
    ? t('shop.ctaSubscribe', {
        plan: selectedPlan === 'PRO' ? 'Pro' : 'Basic',
        price: fmtNum(selectedOffer.perMoUzs || selectedOffer.priceUzs),
      })
    : t('shop.ctaPickPlan');

  const ctaBtnClass = selectedPlan === 'PRO' ? 'btn--pro' : selectedPlan === 'BASIC' ? 'btn--basic' : 'btn--ghost';

  return (
    <div className="shop-scope relative flex min-h-screen w-full flex-col max-w-[430px] mx-auto overflow-x-hidden">
      <header className="sticky top-0 z-10 flex items-center bg-[color:var(--bg-app)] backdrop-blur-md p-4 justify-between shrink-0">
        <button
          type="button"
          aria-label={t('common.goBack')}
          onClick={() => navigate(-1)}
          className="flex size-10 shrink-0 items-center justify-center rounded-xl hover:bg-black/5 dark:hover:bg-white/10"
          style={{ color: 'var(--text-1)' }}
        >
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <h1
          className="flex-1 text-center text-lg font-bold"
          style={{ color: 'var(--text-1)' }}
        >
          {t('shop.title')}
        </h1>
        <div className="w-10" />
      </header>

      {/* Tabs */}
      <div className="shop-tabs">
        <div className="shop-tabs-inner" data-tab={tab} role="tablist">
          <div className="shop-tabs-thumb" aria-hidden="true" />
          <button
            type="button"
            role="tab"
            aria-selected={tab === 'plans'}
            onClick={() => onTab('plans')}
          >
            {t('shop.tabPlans')}
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={tab === 'history'}
            onClick={() => onTab('history')}
          >
            {t('shop.tabHistory')}
          </button>
        </div>
      </div>

      {!auth ? (
        <div className="empty">
          <div className="empty-art">
            <span className="material-symbols-outlined" style={{ fontSize: 40 }}>
              login
            </span>
          </div>
          <div>
            <h4>{t('shop.signInPrompt')}</h4>
            <p>{t('shop.signInPromptDesc')}</p>
          </div>
          <button
            type="button"
            className="btn btn--md btn--basic"
            onClick={() => navigate('/login')}
          >
            {t('shop.goToLogin')}
          </button>
        </div>
      ) : (
        <motion.div
          key={tab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="flex-1 px-4 pb-4"
        >
          {tab === 'plans' && (
            <PlansTab
              currentTier={currentTier}
              expiredAt={subscription?.expiredAt}
              isActive={subscription?.statusCode === 'ACTIVE'}
              subOffersStatus={subOffersStatus}
              subOffersError={subOffersError}
              availablePeriods={availablePeriods}
              bestPeriod={bestPeriod}
              period={period}
              onSelectPeriod={onSelectPeriod}
              grouped={grouped}
              selectedPlan={selectedPlan}
              onSelectPlan={onSelectPlan}
              computeSavePct={computeSavePct}
              onRetry={loadShopSubscriptions}
              t={t}
              formatDate={formatDate}
            />
          )}

          {tab === 'history' && (
            <HistoryTab
              status={txStatus}
              error={txError}
              transactions={transactions}
              onRetry={() => fetchTransactions()}
              onGoPlans={() => onTab('plans')}
              t={t}
              formatDate={formatDate}
            />
          )}
        </motion.div>
      )}

      {/* Sticky CTA bar (only on plans tab) */}
      {auth && tab === 'plans' && subOffersStatus === 'success' && (
        <div className="cta-wrap">
          <button
            type="button"
            className={`btn btn--block btn--lg ${ctaBtnClass}`}
            disabled={!selectedPlan}
            onClick={onCtaClick}
          >
            {ctaLabel}
          </button>
          <button
            type="button"
            className="trial-alt"
            onClick={onTrialClick}
            disabled={!availablePeriods.length}
          >
            <span className="trial-alt-or">{t('shop.or')}</span>
            <span className="trial-alt-label">
              <SparkleIcon />
              {t('shop.trialAltLabel')}
            </span>
            <span className="trial-alt-meta">{t('shop.trialAltMeta')}</span>
          </button>
          <div className="cta-secure">
            <LockIcon />
            <span>{t('shop.secureNote')}</span>
          </div>
        </div>
      )}

      <PaymentMethodModal
        isOpen={checkoutOpen}
        telegramInlineAvailable={Boolean(webApp)}
        isSubmitting={checkoutSubmitting}
        onClose={() => {
          if (checkoutSubmitting) return;
          setCheckoutOpen(false);
          setCheckoutTarget(null);
        }}
        summary={
          checkoutTarget ? (
            <div>
              <p className="font-semibold" style={{ color: 'var(--text-1)' }}>
                {checkoutTarget.name}
              </p>
              <p className="mt-1 text-xs" style={{ color: 'var(--text-2)' }}>
                {t('shop.subscriptionMonthsLabel', { count: checkoutTarget.month })}
                {' · '}
                UZS {fmtNum(checkoutTarget.priceUzs)}
              </p>
              {checkoutTarget.priceStars > 0 && (
                <p className="mt-1 text-xs" style={{ color: 'var(--accent-stars)' }}>
                  {t('shop.stars')}: {checkoutTarget.priceStars.toLocaleString()}
                </p>
              )}
            </div>
          ) : null
        }
        onContinue={(m) => void handleCheckoutContinue(m)}
      />
    </div>
  );
};

export default Shop;

// ───────────────────────────────────────────────────────────
// PlansTab
// ───────────────────────────────────────────────────────────
interface PlansTabProps {
  currentTier: string;
  expiredAt?: string;
  isActive: boolean;
  subOffersStatus: LoadStatus;
  subOffersError: string | null;
  availablePeriods: number[];
  bestPeriod: number | null;
  period: number | null;
  onSelectPeriod: (m: number) => void;
  grouped: Record<PaymentSubscriptionCode, Map<number, ShopSubscriptionOffer>>;
  selectedPlan: PaymentSubscriptionCode | null;
  onSelectPlan: (code: PaymentSubscriptionCode) => void;
  computeSavePct: (code: PaymentSubscriptionCode, month: number) => number | null;
  onRetry: () => void;
  t: (key: TranslationKey, params?: Record<string, string | number>) => string;
  formatDate: (iso?: string | null) => string;
}

const PlansTab = ({
  currentTier,
  expiredAt,
  isActive,
  subOffersStatus,
  subOffersError,
  availablePeriods,
  bestPeriod,
  period,
  onSelectPeriod,
  grouped,
  selectedPlan,
  onSelectPlan,
  computeSavePct,
  onRetry,
  t,
  formatDate,
}: PlansTabProps) => {
  return (
    <div className="flex flex-col gap-4 pt-1">
      <CurrentPlanBanner
        tier={currentTier}
        expiredAt={expiredAt}
        isActive={isActive}
        t={t}
        formatDate={formatDate}
      />

      {subOffersStatus === 'loading' && <PlansSkeleton />}

      {subOffersStatus === 'error' && (
        <div className="empty">
          <div className="empty-art">
            <span className="material-symbols-outlined" style={{ fontSize: 40 }}>
              error
            </span>
          </div>
          <div>
            <h4>{t('shop.loadSubscriptionsError')}</h4>
            <p>{subOffersError ?? ''}</p>
          </div>
          <button
            type="button"
            className="btn btn--md btn--ghost"
            onClick={onRetry}
          >
            {t('common.tryAgain')}
          </button>
        </div>
      )}

      {subOffersStatus === 'success' && availablePeriods.length === 0 && (
        <div className="empty">
          <div className="empty-art">
            <span className="material-symbols-outlined" style={{ fontSize: 40 }}>
              workspace_premium
            </span>
          </div>
          <div>
            <h4>{t('shop.loadSubscriptionsError')}</h4>
          </div>
        </div>
      )}

      {subOffersStatus === 'success' && availablePeriods.length > 0 && (
        <>
          <div className="section-label">
            <h3>{t('shop.unlockMore')}</h3>
            <span className="meta">
              {t('shop.plansCount', { count: PLAN_CODES.length })}
            </span>
          </div>

          {availablePeriods.length > 1 && (
            <div
              className="period-cards"
              style={{
                gridTemplateColumns: `repeat(${availablePeriods.length}, 1fr)`,
              }}
            >
              {availablePeriods.map((m) => {
                const isBest = m === bestPeriod && availablePeriods.length >= 2;
                const isSel = m === period;
                const savePct = computeSavePct('BASIC', m);
                return (
                  <button
                    key={m}
                    type="button"
                    className="period-card"
                    data-selected={isSel}
                    data-best={isBest}
                    onClick={() => onSelectPeriod(m)}
                  >
                    {isBest && (
                      <span className="period-card-best">{t('shop.bestValue')}</span>
                    )}
                    <span className="period-card-num">{m}</span>
                    <span className="period-card-unit">{t('shop.monthsShort')}</span>
                    {savePct ? (
                      <span className="period-card-save" data-best={isBest || undefined}>
                        −{savePct}%
                      </span>
                    ) : (
                      <span className="period-card-save period-card-save--empty">—</span>
                    )}
                  </button>
                );
              })}
            </div>
          )}

          <div className="plans-rows">
            {PLAN_CODES.map((code) => {
              const offer = period !== null ? grouped[code].get(period) ?? null : null;
              if (!offer) return null;
              return (
                <PlanCard
                  key={code}
                  code={code}
                  offer={offer}
                  selected={selectedPlan === code}
                  onSelect={() => onSelectPlan(code)}
                  isCurrent={currentTier === code.toLowerCase()}
                  t={t}
                />
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};

// ───────────────────────────────────────────────────────────
// Current Plan Banner
// ───────────────────────────────────────────────────────────
interface CurrentPlanBannerProps {
  tier: string;
  expiredAt?: string;
  isActive: boolean;
  t: (key: TranslationKey, params?: Record<string, string | number>) => string;
  formatDate: (iso?: string | null) => string;
}

const CurrentPlanBanner = ({
  tier,
  expiredAt,
  isActive,
  t,
  formatDate,
}: CurrentPlanBannerProps) => {
  const variant = !isActive ? 'free' : tier === 'pro' ? 'pro' : 'basic';

  if (variant === 'free') {
    const features = [
      t('shop.freeFeature1'),
      t('shop.freeFeature2'),
      t('shop.freeFeature3'),
      t('shop.freeFeature4'),
    ];
    return (
      <div className="cpb">
        <div className="cpb-row">
          <div className="cpb-icon">
            <BookmarkIcon />
          </div>
          <div className="cpb-body">
            <div className="cpb-eyebrow">{t('shop.currentPlan')}</div>
            <div className="cpb-title">{t('shop.tierFree')}</div>
            <div className="cpb-sub">{t('shop.freeSubtitle')}</div>
          </div>
        </div>
        <ul className="cpb-features">
          {features.map((f, i) => (
            <li key={i}>
              <CheckIcon />
              <span>{f}</span>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  const planName = variant === 'pro' ? 'PRO' : 'BASIC';
  const className = variant === 'pro' ? 'cpb cpb--pro' : 'cpb cpb--basic';
  return (
    <div className={className}>
      <div className="cpb-row">
        <div className="cpb-icon">
          <ShieldIcon />
        </div>
        <div className="cpb-body">
          <div className="cpb-eyebrow">{t('shop.currentPlan')}</div>
          <div className="cpb-title">
            {planName}
            <span className="cpb-dot" />
          </div>
          <div className="cpb-sub">
            {t('shop.activeUntil', { date: formatDate(expiredAt) })}
          </div>
        </div>
      </div>
    </div>
  );
};

// ───────────────────────────────────────────────────────────
// Plan Card
// ───────────────────────────────────────────────────────────
interface PlanCardProps {
  code: PaymentSubscriptionCode;
  offer: ShopSubscriptionOffer;
  selected: boolean;
  onSelect: () => void;
  isCurrent: boolean;
  t: (key: TranslationKey, params?: Record<string, string | number>) => string;
}

const PlanCard = ({ code, offer, selected, onSelect, isCurrent, t }: PlanCardProps) => {
  const isPro = code === 'PRO';
  const className = `plan ${isPro ? 'plan--pro' : 'plan--basic'}`;
  const heroKey: TranslationKey = isPro ? 'shop.proHero' : 'shop.basicHero';
  const extrasKeys: TranslationKey[] = isPro
    ? ['shop.proExtra1', 'shop.proExtra2', 'shop.proExtra3', 'shop.proExtra4']
    : [
        'shop.basicExtra1',
        'shop.basicExtra2',
        'shop.basicExtra3',
        'shop.basicExtra4',
        'shop.basicExtra5',
      ];
  const extras = extrasKeys.map((k) => t(k));
  const perMo = offer.perMoUzs || offer.priceUzs;

  return (
    <button
      type="button"
      className={className}
      data-selected={selected}
      onClick={onSelect}
    >
      {isPro && <span className="plan-glow" aria-hidden="true" />}
      {isPro && !isCurrent && <span className="plan-badge">★ {t('shop.hit')}</span>}

      <div className="plan-h-top">
        <div className="plan-h-left">
          <div className="plan-h-radio">
            <CheckIcon strokeWidth={2.6} />
          </div>
          <div className="plan-h-titlewrap">
            <div className="plan-head">
              <ShieldIcon size={14} />
              <span>{isPro ? 'Pro' : 'Basic'}</span>
            </div>
            <span className="trial-chip">
              <SparkleIcon size={9} />
              {t('shop.trialChip')}
            </span>
          </div>
        </div>
        <div className="plan-h-price">
          <div className="plan-h-price-row">
            <span className="plan-price-num">{fmtNum(perMo)}</span>
            <span className="plan-price-unit">{t('shop.uzsPerMonth')}</span>
          </div>
          {offer.month > 1 && (
            <div className="plan-h-price-meta">
              {t('shop.totalLabel', { total: fmtNum(offer.priceUzs) })}
            </div>
          )}
          {(offer.priceStars > 0 || offer.priceUsd > 0) && (
            <div className="plan-h-price-meta" style={{ marginTop: 2 }}>
              {offer.priceStars > 0 && (
                <span>{offer.priceStars.toLocaleString()} ⭐</span>
              )}
              {offer.priceStars > 0 && offer.priceUsd > 0 && ' · '}
              {offer.priceUsd > 0 && <span>${offer.priceUsd}</span>}
            </div>
          )}
        </div>
      </div>

      <ul className="plan-features plan-features--hero">
        <li>
          <CheckIcon strokeWidth={2.4} />
          <span>{t(heroKey)}</span>
        </li>
      </ul>

      <div className="plan-features-reveal" data-open={selected}>
        <div>
          <ul className="plan-features plan-features--extra">
            {extras.map((f, i) => (
              <li key={i} style={{ animationDelay: `${i * 35}ms` }}>
                <CheckIcon strokeWidth={2.4} />
                <span>{f}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {!selected && (
        <span className="plan-h-hint">
          + {t('shop.moreFeatures', { count: extras.length })}
        </span>
      )}
    </button>
  );
};

// ───────────────────────────────────────────────────────────
// History Tab
// ───────────────────────────────────────────────────────────
interface HistoryTabProps {
  status: LoadStatus;
  error: string | null;
  transactions: import('../../lib/api/paymentClient').PaymentTransactionResponse[];
  onRetry: () => void;
  onGoPlans: () => void;
  t: (key: TranslationKey, params?: Record<string, string | number>) => string;
  formatDate: (iso?: string | null) => string;
}

const HistoryTab = ({
  status,
  error,
  transactions,
  onRetry,
  onGoPlans,
  t,
  formatDate,
}: HistoryTabProps) => {
  if (status === 'loading') return <HistorySkeleton />;

  if (status === 'error') {
    return (
      <div className="empty">
        <div className="empty-art">
          <span className="material-symbols-outlined" style={{ fontSize: 40 }}>
            history
          </span>
        </div>
        <div>
          <h4>{t('shop.loadHistoryError')}</h4>
          <p>{error ?? ''}</p>
        </div>
        <button type="button" className="btn btn--md btn--ghost" onClick={onRetry}>
          {t('common.tryAgain')}
        </button>
      </div>
    );
  }

  if (status === 'success' && transactions.length === 0) {
    return (
      <div className="empty">
        <div className="empty-art">
          <span className="material-symbols-outlined" style={{ fontSize: 40 }}>
            receipt_long
          </span>
        </div>
        <div>
          <h4>{t('shop.emptyHistoryTitle')}</h4>
          <p>{t('shop.emptyHistoryDesc')}</p>
        </div>
        <button type="button" className="btn btn--md btn--pro" onClick={onGoPlans}>
          {t('shop.pickPlan')}
          <ArrowRightIcon />
        </button>
      </div>
    );
  }

  if (status !== 'success') return null;

  return (
    <div className="pt-1">
      <div className="section-label">
        <h3>{t('shop.transactions')}</h3>
        <span className="meta">
          {t('shop.recordsCount', { count: transactions.length })}
        </span>
      </div>
      <div className="tx-list">
        {transactions.map((tx) => {
          const providerKey = (tx.provider ?? '').toLowerCase();
          const providerLabel =
            providerKey === 'telegram'
              ? 'Stars'
              : providerKey
                ? providerKey.charAt(0).toUpperCase() + providerKey.slice(1)
                : '—';
          const iconClass = `tx-icon tx-icon--${providerKey || 'default'}`;
          const iconChar = providerLabel.charAt(0).toUpperCase();
          return (
            <div className="tx" key={tx.uid}>
              <div className={iconClass}>{iconChar}</div>
              <div className="tx-body">
                <div className="tx-title">{providerLabel}</div>
                <div className="tx-meta">
                  <span>{t(`subscription.txStatus.${tx.status}` as TranslationKey)}</span>
                </div>
                <div className="tx-date">
                  {formatDate(tx.completedAt ?? tx.createdAt ?? tx.updatedAt)}
                </div>
              </div>
              <div className="tx-right">
                <div className="tx-amount">
                  {typeof tx.coins === 'number' ? `${fmtNum(tx.coins)} ⭐` : '—'}
                </div>
                <div className={`tx-status tx-status--${tx.status}`}>
                  {t(`shop.statusLabel.${tx.status}` as TranslationKey)}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ───────────────────────────────────────────────────────────
// Skeletons
// ───────────────────────────────────────────────────────────
const PlansSkeleton = () => (
  <div className="flex flex-col gap-3 pt-2">
    <div className="sk" style={{ height: 110, borderRadius: 16 }} />
    <div className="sk" style={{ height: 92, borderRadius: 12 }} />
    <div className="sk" style={{ height: 140, borderRadius: 16 }} />
    <div className="sk" style={{ height: 140, borderRadius: 16 }} />
  </div>
);

const HistorySkeleton = () => (
  <div className="tx-list">
    {[0, 1, 2, 3, 4].map((i) => (
      <div className="tx" key={i}>
        <div className="sk" style={{ width: 36, height: 36, borderRadius: 10 }} />
        <div className="tx-body" style={{ gap: 6 }}>
          <div className="sk" style={{ width: '60%', height: 12 }} />
          <div className="sk" style={{ width: '40%', height: 10 }} />
          <div className="sk" style={{ width: '30%', height: 9 }} />
        </div>
        <div className="tx-right" style={{ gap: 5 }}>
          <div className="sk" style={{ width: 50, height: 12 }} />
          <div className="sk" style={{ width: 60, height: 16, borderRadius: 999 }} />
        </div>
      </div>
    ))}
  </div>
);

// ───────────────────────────────────────────────────────────
// Inline icons (kept lightweight; mockup uses thin strokes)
// ───────────────────────────────────────────────────────────
const CheckIcon = ({ size = 12, strokeWidth = 2.4 }: { size?: number; strokeWidth?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);
const ShieldIcon = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);
const BookmarkIcon = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
  </svg>
);
const SparkleIcon = ({ size = 12 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2l1.8 6.4L20 10l-6.2 1.6L12 18l-1.8-6.4L4 10l6.2-1.6z" />
  </svg>
);
const LockIcon = () => (
  <svg width={11} height={11} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);
const ArrowRightIcon = () => (
  <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12" />
    <polyline points="12 5 19 12 12 19" />
  </svg>
);
