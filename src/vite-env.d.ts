/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string;
  readonly VITE_ACCOUNT_API_BASE_URL: string;
  readonly VITE_PAYMENT_API_BASE_URL: string;
  readonly VITE_MINIAPP_CLIENT_KEY: string;
  readonly VITE_MEDIA_BASE_URL: string;
  readonly VITE_MEDIA_PROXY_PREFIX: string;
  /** В dev: `false` — не использовать Vite proxy, бить напрямую в URL из .env (нужен CORS на бэке). */
  readonly VITE_DEV_PROXY?: string;
}
