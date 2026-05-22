/** Префиксы dev-прокси Vite (`vite.config.ts`); браузер бьёт в тот же origin — без CORS. */
export const WZ_DEV_PROXY_PREFIX = {
  api: '/wz-dev/api',
  account: '/wz-dev/account',
  payment: '/wz-dev/payment',
} as const;
