import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { PaymentMethodModal, type CoinCheckoutMethod } from '../../components/payment';
import { useTranslation } from '../../lib/i18n';
import { useTelegram } from '../../lib/telegram/index';
import { isAuthenticated } from '../../lib/api/client';
import {
  createTelegramInvoice,
  confirmTelegramPayment,
} from '../../lib/api/telegramPayment';
import { getPrices } from '../../lib/api/pricing';
import type { PackageResponse, PriceResponse } from '../../lib/api/pricing';
import { getShopSubscriptions } from '../../lib/api/shop';
import type {
  ShopSubscriptionOffer,
  SubscriptionsResponse,
} from '../../lib/api/shop';
import {
  useUserStore,
  useSubscriptionStore,
  useTransactionsStore,
  useUsageStore,
} from '../../lib/stores';
import { FREE_TIER_LIMITS } from '../../lib/constants/freeTierLimits';
import {
  Button,
  Card,
  EmptyState,
  Skeleton,
} from '../../components/ui';

type ShopTab = 'coins' | 'subscription' | 'history';

type CheckoutTarget =
  | { kind: 'coins'; pkg: PackageResponse }
  | { kind: 'subscription'; offer: ShopSubscriptionOffer };

type LoadStatus = 'idle' | 'loading' | 'success' | 'error';

const Shop = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { haptic, webApp } = useTelegram();

  const user = useUserStore((s) => s.user);
  const refreshAccount = useUserStore((s) => s.refreshAccount);

  const {
    subscription,
    getCurrentTier,
  } = useSubscriptionStore();

  const {
    transactions,
    status: txStatus,
    error: txError,
    fetchTransactions,
  } = useTransactionsStore();

  const remainingNewWords = useUsageStore((s) => s.remainingNewWords);

  const [checkoutTarget, setCheckoutTarget] = useState<CheckoutTarget | null>(
    null,
  );
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [checkoutSubmitting, setCheckoutSubmitting] = useState(false);

  const [tab, setTab] = useState<ShopTab>('coins');
  const [pricesStatus, setPricesStatus] = useState<LoadStatus>('idle');
  const [pricesData, setPricesData] = useState<PriceResponse | null>(null);
  const [pricesError, setPricesError] = useState<string | null>(null);

  const [subOffersStatus, setSubOffersStatus] = useState<LoadStatus>('idle');
  const [subOffersData, setSubOffersData] = useState<SubscriptionsResponse | null>(
    null,
  );
  const [subOffersError, setSubOffersError] = useState<string | null>(null);

  const auth = isAuthenticated();
  const currentTier = getCurrentTier();

  useEffect(() => {
    if (auth) void refreshAccount();
  }, [auth, refreshAccount]);

  const loadPrices = useCallback(async () => {
    setPricesStatus('loading');
    setPricesError(null);
    try {
      const data = await getPrices();
      setPricesData(data);
      setPricesStatus('success');
    } catch (e) {
      setPricesStatus('error');
      setPricesError(e instanceof Error ? e.message : t('shop.loadPackagesError'));
    }
  }, [t]);

  useEffect(() => {
    if (!auth) return;
    if (tab !== 'coins') return;
    if (pricesStatus !== 'idle') return;
    const id = requestAnimationFrame(() => {
      void loadPrices();
    });
    return () => cancelAnimationFrame(id);
  }, [auth, tab, pricesStatus, loadPrices]);

  useEffect(() => {
    if (!auth) return;
    if (tab !== 'subscription') return;
    void refreshAccount();
  }, [auth, tab, refreshAccount]);

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
    if (tab !== 'subscription') return;
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

  const formatDate = (iso?: string) => {
    if (!iso) return '—';
    return new Date(iso).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const onTab = (next: ShopTab) => {
    haptic.selection();
    setTab(next);
  };

  const handleBuyCoins = (pkg: PackageResponse) => {
    haptic.impact('medium');
    setCheckoutTarget({ kind: 'coins', pkg });
    setCheckoutOpen(true);
  };

  const handleBuySubscriptionOffer = (offer: ShopSubscriptionOffer) => {
    haptic.impact('medium');
    setCheckoutTarget({ kind: 'subscription', offer });
    setCheckoutOpen(true);
  };

  const handleCheckoutContinue = async (chosen: CoinCheckoutMethod) => {
    const target = checkoutTarget;
    if (!target) return;

    const packageId =
      target.kind === 'coins' ? target.pkg.packageId : target.offer.packageId;

    const closeAndClearCheckout = (): void => {
      setCheckoutOpen(false);
      setCheckoutSubmitting(false);
      setCheckoutTarget(null);
    };

    const notify = (msg: string): void => {
      if (webApp?.showAlert) {
        webApp.showAlert(msg);
      } else {
        window.alert(msg);
      }
    };

    if (chosen === 'payme_uz') {
      closeAndClearCheckout();
      notify(t('shop.paymeUzSoon'));
      return;
    }

    if (chosen === 'click_uz') {
      closeAndClearCheckout();
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
        packageId,
        idempotencyKey: `${packageId}-${Date.now()}`,
      });
      setCheckoutOpen(false);
      setCheckoutSubmitting(false);
      setCheckoutTarget(null);

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
        } else if (status === 'cancelled') {
          // user closed invoice
        } else {
          webApp.showAlert(`${t('shop.purchaseError')} (${status})`);
        }
      });
    } catch (err) {
      setCheckoutSubmitting(false);
      haptic.notification('error');
      notify(err instanceof Error ? err.message : t('shop.purchaseError'));
    }
  };

  const tabClass = (isActive: boolean) =>
    [
      'flex-1 rounded-lg py-2.5 text-center text-sm font-semibold transition-all',
      isActive
        ? 'bg-white dark:bg-gray-900 shadow text-gray-900 dark:text-white'
        : 'text-gray-500 dark:text-gray-400',
    ].join(' ');

  return (
    <div className="relative flex min-h-screen w-full flex-col max-w-[430px] mx-auto overflow-x-hidden bg-gray-50 dark:bg-background-dark">
      <header className="sticky top-0 z-10 flex items-center bg-gray-50/80 dark:bg-background-dark/80 backdrop-blur-md p-4 justify-between shrink-0">
        <button
          type="button"
          aria-label={t('common.goBack')}
          onClick={() => navigate(-1)}
          className="text-gray-800 dark:text-white flex size-10 shrink-0 items-center justify-center rounded-xl hover:bg-black/5 dark:hover:bg-white/10"
        >
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <h1 className="flex-1 text-center text-lg font-bold text-gray-800 dark:text-white">
          {t('shop.title')}
        </h1>
        <div className="w-10" />
      </header>

      <div className="px-4 pt-2 pb-3">
        <div
          className="flex gap-1 rounded-xl bg-gray-100 dark:bg-gray-800 p-1"
          role="tablist"
        >
          <button
            type="button"
            role="tab"
            aria-selected={tab === 'coins'}
            aria-label={t('shop.tabCoinsAria')}
            className={tabClass(tab === 'coins')}
            onClick={() => onTab('coins')}
          >
            {t('shop.tabCoins')}
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={tab === 'subscription'}
            aria-label={t('shop.tabSubscriptionAria')}
            className={tabClass(tab === 'subscription')}
            onClick={() => onTab('subscription')}
          >
            {t('shop.tabSubscription')}
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={tab === 'history'}
            aria-label={t('shop.tabHistoryAria')}
            className={tabClass(tab === 'history')}
            onClick={() => onTab('history')}
          >
            {t('shop.tabHistory')}
          </button>
        </div>
      </div>

      {!auth ? (
        <EmptyState
          icon={<span className="material-symbols-outlined text-5xl text-primary">login</span>}
          title={t('shop.signInPrompt')}
          description={t('shop.signInPromptDesc')}
          action={{
            label: t('shop.goToLogin'),
            onClick: () => navigate('/login'),
          }}
        />
      ) : (
        <motion.div
          key={tab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="flex-1 px-4 pb-28"
        >
          {tab === 'coins' && (
            <>
              <Card padding="md" className="mb-4 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-card">
                <p className="text-xs uppercase tracking-wide text-gray-400">
                  {t('shop.balance')}
                </p>
                <div className="mt-1 flex items-center gap-2">
                  <span
                    className="material-symbols-outlined text-amber-500"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    monetization_on
                  </span>
                  <span className="text-2xl font-bold text-gray-900 dark:text-white">
                    {(user?.octoCoins ?? 0).toLocaleString()}
                  </span>
                  <span className="text-sm text-gray-500">{t('shop.octoCoins')}</span>
                </div>
              </Card>

              <h2 className="mb-3 text-base font-bold text-gray-900 dark:text-white">
                {t('shop.coinPackages')}
              </h2>

              {pricesStatus === 'loading' && (
                <div className="grid grid-cols-2 gap-3">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="rounded-card bg-white dark:bg-gray-900 p-4 border border-gray-100 dark:border-gray-800 space-y-2">
                      <Skeleton className="h-4 w-2/3" />
                      <Skeleton className="h-8 w-1/2" />
                      <Skeleton className="h-9 w-full rounded-xl" />
                    </div>
                  ))}
                </div>
              )}

              {pricesStatus === 'error' && (
                <EmptyState
                  icon={<span className="material-symbols-outlined text-5xl text-gray-300">sell</span>}
                  title={t('shop.loadPackagesError')}
                  description={pricesError ?? ''}
                  action={{
                    label: t('common.tryAgain'),
                    onClick: () => loadPrices(),
                  }}
                />
              )}

              {pricesStatus === 'success' && pricesData?.packages?.length === 0 && (
                <p className="text-center text-sm text-gray-500 py-8">
                  {t('shop.loadPackagesError')}
                </p>
              )}

              {pricesStatus === 'success' &&
                !!pricesData?.packages?.length &&
                (
                  <div className="grid grid-cols-2 gap-3">
                    {pricesData.packages.map((pkg) => (
                      <Card
                        key={pkg.packageId}
                        variant="flat"
                        padding="md"
                        className="border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 flex flex-col gap-3"
                      >
                        <div>
                          <p className="font-bold text-gray-900 dark:text-white line-clamp-2 text-sm leading-tight">
                            {pkg.name}
                          </p>
                          <p className="mt-2 flex items-center gap-1 text-lg font-black text-gray-900 dark:text-white">
                            <span className="material-symbols-outlined text-amber-500 text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                              monetization_on
                            </span>
                            {pkg.coin?.toLocaleString?.() ?? pkg.coin}
                          </p>
                          <div className="mt-2 space-y-0.5 text-[11px] text-gray-500">
                            {pkg.priceStars > 0 && (
                              <p>
                                {t('shop.stars')}: {pkg.priceStars.toLocaleString()}
                              </p>
                            )}
                            {pkg.priceUzs > 0 && (
                              <p>
                                UZS {pkg.priceUzs.toLocaleString()}
                              </p>
                            )}
                            {pkg.priceUsd > 0 && (
                              <p>USD {pkg.priceUsd}</p>
                            )}
                          </div>
                        </div>
                        <Button
                          type="button"
                          variant="primary"
                          size="sm"
                          fullWidth
                          className="mt-auto"
                          onClick={() => handleBuyCoins(pkg)}
                        >
                          {t('shop.buyCoins')}
                        </Button>
                      </Card>
                    ))}
                  </div>
                )}
            </>
          )}

          {tab === 'subscription' && (
            <>
              <p className="mb-3 text-sm text-gray-600 dark:text-gray-400">
                {t('shop.subscriptionTabHint')}
              </p>

              <Card padding="md" className="mb-4 bg-gradient-to-br from-primary to-purple-600 border-0 shadow-lg shadow-primary/20 text-white">
                <p className="text-xs uppercase tracking-wider opacity-80">
                  {t('subscription.yourPlan')}
                </p>
                <p className="mt-1 text-2xl font-bold">{t(`subscription.${currentTier}`)}</p>
                {subscription && subscription.statusCode === 'ACTIVE' ? (
                  <p className="mt-2 text-sm opacity-90">
                    {t('subscription.activeUntil', {
                      date: formatDate(subscription.expiredAt),
                    })}
                  </p>
                ) : (
                  <p className="mt-2 text-sm opacity-90">
                    {t('usage.newWordsRemaining', {
                      remaining: remainingNewWords(),
                      limit: FREE_TIER_LIMITS.NEW_WORDS_PER_DAY,
                    })}
                  </p>
                )}
              </Card>

              <h2 className="mb-3 text-base font-bold text-gray-900 dark:text-white">
                {t('shop.subscriptionOffersTitle')}
              </h2>

              {subOffersStatus === 'loading' && (
                <div className="grid grid-cols-1 gap-3 mb-4">
                  {[1, 2].map((i) => (
                    <Card
                      key={i}
                      padding="md"
                      className="border border-gray-100 dark:border-gray-800"
                    >
                      <Skeleton className="h-5 w-2/3 mb-2" />
                      <Skeleton className="h-8 w-1/2 mb-1" />
                      <Skeleton className="h-9 w-full rounded-xl mt-3" />
                    </Card>
                  ))}
                </div>
              )}

              {subOffersStatus === 'error' && (
                <EmptyState
                  className="py-8 mb-4"
                  icon={<span className="material-symbols-outlined text-5xl text-gray-300">workspace_premium</span>}
                  title={t('shop.loadSubscriptionsError')}
                  description={subOffersError ?? ''}
                  action={{
                    label: t('common.tryAgain'),
                    onClick: () => void loadShopSubscriptions(),
                  }}
                />
              )}

              {subOffersStatus === 'success' &&
                subOffersData &&
                subOffersData.subscriptions.length === 0 && (
                  <p className="mb-4 text-center text-sm text-gray-500">
                    {t('shop.loadSubscriptionsError')}
                  </p>
                )}

              {subOffersStatus === 'success' &&
                !!subOffersData?.subscriptions?.length && (
                  <div className="grid grid-cols-1 gap-3 mb-4">
                    {subOffersData.subscriptions.map((offer) => (
                      <Card
                        key={offer.packageId}
                        variant="flat"
                        padding="md"
                        className="border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 flex flex-col gap-3"
                      >
                        <div>
                          <div className="flex items-start justify-between gap-2">
                            <p className="font-bold text-gray-900 dark:text-white leading-tight">
                              {offer.name}
                            </p>
                            <span className="shrink-0 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary uppercase">
                              {offer.code}
                            </span>
                          </div>
                          <p className="mt-1 text-xs text-gray-500">
                            {t('shop.subscriptionMonthsLabel', { count: offer.month })}
                          </p>
                          <div className="mt-2 space-y-0.5 text-[11px] text-gray-500">
                            {offer.priceStars > 0 && (
                              <p>
                                {t('shop.stars')}: {offer.priceStars.toLocaleString()}
                              </p>
                            )}
                            {offer.priceCoin > 0 && (
                              <p>
                                {offer.priceCoin.toLocaleString()} {t('shop.octoCoins')}
                              </p>
                            )}
                            {offer.priceUzs > 0 && (
                              <p>UZS {offer.priceUzs.toLocaleString()}</p>
                            )}
                            {offer.priceUsd > 0 && <p>USD {offer.priceUsd}</p>}
                            {offer.savedCoins > 0 && (
                              <p className="text-green-600 dark:text-green-400">
                                −{offer.savedCoins} {t('shop.octoCoins')}
                              </p>
                            )}
                          </div>
                        </div>
                        <Button
                          type="button"
                          variant="primary"
                          size="sm"
                          fullWidth
                          className="mt-auto"
                          onClick={() => handleBuySubscriptionOffer(offer)}
                        >
                          {t('shop.buySubscription')}
                        </Button>
                      </Card>
                    ))}
                  </div>
                )}

              <Button
                variant="secondary"
                fullWidth
                onClick={() => {
                  haptic.impact('light');
                  navigate('/subscription');
                }}
              >
                {t('shop.allPlansCta')}
              </Button>
            </>
          )}

          {tab === 'history' && (
            <>
              {txStatus === 'loading' && (
                <div className="space-y-3">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="flex justify-between rounded-xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 p-3">
                      <div className="space-y-2 flex-1">
                        <Skeleton className="h-4 w-1/3" />
                        <Skeleton className="h-3 w-1/2" />
                      </div>
                      <Skeleton className="h-6 w-16" />
                    </div>
                  ))}
                </div>
              )}

              {txStatus === 'error' && (
                <EmptyState
                  icon={<span className="material-symbols-outlined text-5xl text-gray-300">history</span>}
                  title={t('shop.loadHistoryError')}
                  description={txError ?? ''}
                  action={{
                    label: t('common.tryAgain'),
                    onClick: () => fetchTransactions(),
                  }}
                />
              )}

              {txStatus === 'success' && transactions.length === 0 && (
                <EmptyState
                  icon={<span className="material-symbols-outlined text-5xl text-gray-300">payments</span>}
                  title={t('shop.emptyHistoryTitle')}
                  description={t('shop.emptyHistoryDesc')}
                />
              )}

              {txStatus === 'success' && transactions.length > 0 && (
                <ul className="space-y-2">
                  {transactions.map((tx) => (
                    <li key={tx.uid}>
                      <Card
                        variant="flat"
                        padding="md"
                        className="flex items-center justify-between border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900"
                      >
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {tx.provider}
                          </p>
                          <p className="text-xs text-gray-500 mt-0.5">
                            {formatDate(tx.completedAt ?? tx.createdAt ?? tx.updatedAt)} ·{' '}
                            {t(`subscription.txStatus.${tx.status}`)}
                          </p>
                        </div>
                        <div className="flex items-center gap-1 shrink-0 text-amber-500">
                          <span
                            className="material-symbols-outlined text-base"
                            style={{ fontVariationSettings: "'FILL' 1" }}
                          >
                            monetization_on
                          </span>
                          <span className="font-bold text-gray-900 dark:text-white">
                            {typeof tx.coins === 'number' ? tx.coins.toLocaleString() : '—'}
                          </span>
                        </div>
                      </Card>
                    </li>
                  ))}
                </ul>
              )}
            </>
          )}
        </motion.div>
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
          checkoutTarget?.kind === 'coins' ? (
            <div>
              <p className="font-semibold text-gray-900 dark:text-white">
                {checkoutTarget.pkg.name}
              </p>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                {checkoutTarget.pkg.coin.toLocaleString()} {t('shop.octoCoins')}
              </p>
              {checkoutTarget.pkg.priceStars > 0 && (
                <p className="mt-1 text-xs text-amber-600 dark:text-amber-400">
                  {t('shop.stars')}: {checkoutTarget.pkg.priceStars.toLocaleString()}
                </p>
              )}
            </div>
          ) : checkoutTarget?.kind === 'subscription' ? (
            <div>
              <p className="font-semibold text-gray-900 dark:text-white">
                {checkoutTarget.offer.name}
              </p>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                {t('shop.subscriptionCodeBadge', { code: checkoutTarget.offer.code })}{' '}
                · {t('shop.subscriptionMonthsLabel', { count: checkoutTarget.offer.month })}
              </p>
              {checkoutTarget.offer.priceStars > 0 && (
                <p className="mt-1 text-xs text-amber-600 dark:text-amber-400">
                  {t('shop.stars')}: {checkoutTarget.offer.priceStars.toLocaleString()}
                </p>
              )}
              {checkoutTarget.offer.priceCoin > 0 && (
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  {checkoutTarget.offer.priceCoin.toLocaleString()} {t('shop.octoCoins')}
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
