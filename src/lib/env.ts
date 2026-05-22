import { WZ_DEV_PROXY_PREFIX as P } from './wzDevProxyPrefixes';

type EnvName =
  | 'VITE_API_BASE_URL'
  | 'VITE_ACCOUNT_API_BASE_URL'
  | 'VITE_PAYMENT_API_BASE_URL'
  | 'VITE_MINIAPP_CLIENT_KEY'
  | 'VITE_MEDIA_BASE_URL'
  | 'VITE_MEDIA_PROXY_PREFIX';

function required(name: EnvName): string {
  const value = import.meta.env[name];
  if (value === undefined || String(value).trim() === '') {
    throw new Error(
      `[env] Отсутствует ${name}. Скопируйте .env.example в .env и перезапустите Vite.`,
    );
  }
  return String(value).trim();
}

/** В dev по умолчанию API идут через Vite proxy (см. vite.config). Отключить: VITE_DEV_PROXY=false */
function devProxyEnabled(): boolean {
  return import.meta.env.DEV && import.meta.env.VITE_DEV_PROXY !== 'false';
}

/** api-wordzen: курсы, аутентификация. */
export const viteApiBaseUrl = (): string =>
  devProxyEnabled() ? P.api : required('VITE_API_BASE_URL').replace(/\/+$/, '');

/** account-wordzen: аккаунт (коины, подписка), друзья, рейтинги. */
export const viteAccountApiBaseUrl = (): string =>
  devProxyEnabled() ? P.account : required('VITE_ACCOUNT_API_BASE_URL').replace(/\/+$/, '');

/** payment-wordzen: платежный шлюз. */
export const vitePaymentApiBaseUrl = (): string =>
  devProxyEnabled() ? P.payment : required('VITE_PAYMENT_API_BASE_URL').replace(/\/+$/, '');

export const viteMiniappClientKey = (): string => required('VITE_MINIAPP_CLIENT_KEY');

export const viteMediaBaseUrl = (): string => required('VITE_MEDIA_BASE_URL').replace(/\/+$/, '');

export const viteMediaProxyPrefix = (): string =>
  required('VITE_MEDIA_PROXY_PREFIX').replace(/\/+$/, '');
