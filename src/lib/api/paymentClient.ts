/**
 * HTTP-клиент payment-api (`payment-api.md` § «Базовые правила»).
 *
 * - Префикс маршрутов: `/api/v1`.
 * - Публичные маршруты (Bearer не обязателен): `GET .../price/**`, `GET .../shop/**`.
 * - Остальное: `Authorization: Bearer` при наличии токена + `X-Client-Key` (мини-приложение: TELEGRAM).
 */
import axios, {
  type AxiosInstance,
  type AxiosError,
  type InternalAxiosRequestConfig,
} from 'axios';
import {
  getAccessToken,
  getRefreshToken,
  setTokens,
  clearTokens,
  getMiniappClientKey,
} from './client';
import { viteApiBaseUrl, vitePaymentApiBaseUrl } from '../env';

/** Корневой префикс REST payment-api. */
export const PAYMENT_API_V1_PREFIX = '/api/v1';

/**
 * Начала путей, для которых документ не требует авторизации пользователя.
 * На них всё равно уходит `X-Client-Key` для идентификации клиента.
 */
export const PAYMENT_PUBLIC_PATH_PREFIXES = [
  `${PAYMENT_API_V1_PREFIX}/price`,
  `${PAYMENT_API_V1_PREFIX}/shop`,
] as const;

export function isPaymentPublicPath(url: string): boolean {
  try {
    const pathname = url.startsWith('http')
      ? new URL(url).pathname
      : url.split('?')[0] ?? url;
    return PAYMENT_PUBLIC_PATH_PREFIXES.some((p) => pathname.startsWith(p));
  } catch {
    return PAYMENT_PUBLIC_PATH_PREFIXES.some((p) => url.startsWith(p));
  }
}

const PAYMENT_API_BASE_URL = vitePaymentApiBaseUrl();
/** Тот же host, где auth refresh (api-wordzen). */
const AUTH_API_BASE_URL = viteApiBaseUrl();

/** Queue for token refresh to prevent concurrent refresh attempts. */
let refreshPromise: Promise<void> | null = null;

// Shared response envelope from the payment service. The error code is an
// integer here, not a string like the main API — the union covers both.
export interface PaymentApiResponse<T> {
  success: boolean;
  data: T;
  error?: {
    message: string;
    detail?: string;
    code?: number | string;
    uid?: string;
  };
}

// ---------------------------------------------------------------------------
// payment-api.md — «Справочники»
// ---------------------------------------------------------------------------

/** `ProviderCode` */
export type PaymentProvider = 'GOOGLE' | 'TELEGRAM' | 'PAYME' | 'CLICK';

/** `CurrencyCode` */
export type PaymentCurrency = 'TG_STARS' | 'UZS' | 'USD';

/** `TransactionStatusCode` */
export type PaymentTransactionStatus =
  | 'CREATED'
  | 'PENDING'
  | 'SUCCESS'
  | 'FAILED'
  | 'REFUNDED'
  | 'CANCELLED';

/** `SubscriptionCode` */
export type PaymentSubscriptionCode = 'BASIC' | 'PRO';

/**
 * Статус карты в `CardResponse`. В доке для подтверждённой карты — `VERIFIED`.
 * `CONFIRMED` сохраняем для совместимости со старыми ответами.
 */
export type PaymentCardStatus =
  | 'CREATED'
  | 'VERIFIED'
  | 'CONFIRMED'
  | 'FAILED';

// ---------------------------------------------------------------------------
// payment-api.md — «Основные модели ответа»
// ---------------------------------------------------------------------------

/**
 * `CardResponse`. В сокращённом списке `CardsResponse` бэкенд может не отдавать
 * `createdAt` / `updatedAt`.
 */
export interface CardResponse {
  uid: string;
  userUid: string;
  createdAt?: string;
  updatedAt?: string;
  number: string;
  expireDate: string;
  provider: PaymentProvider;
  status: PaymentCardStatus;
}

/** `CardsResponse` */
export interface CardsResponse {
  cards: CardResponse[];
}

/** `PaymentTransactionResponse` (полный объект; в списке возможны только часть полей — см. пример в `payment-api.md`). */
export interface PaymentTransactionResponse {
  uid: string;
  userUid: string;
  createdAt?: string;
  updatedAt?: string;
  completedAt?: string | null;
  provider: PaymentProvider;
  status: PaymentTransactionStatus;
  coins: number;
}

/** Обертка списка транзакций (`GET /transactions`). */
export interface PaymentTransactionsResponse {
  transactions: PaymentTransactionResponse[];
}

/** Ответы `POST /click/callback/prepare` и `POST /click/callback/complete` (провайдер; не мини-приложение). */
export interface ClickProviderCallbackResponse {
  click_trans_id?: string;
  merchant_trans_id?: string;
  merchant_prepare_id?: string;
  error: number;
  error_note?: string;
}

const paymentClient: AxiosInstance = axios.create({
  baseURL: PAYMENT_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'X-Client-Key': getMiniappClientKey(),
  },
  timeout: 30000,
});

paymentClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getAccessToken();
    console.log('[PaymentClient] Request to:', config.url, '| Token available?', !!token, '| Token length:', token?.length || 0);

    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('[PaymentClient] Authorization header set:', {
        tokenStart: token.substring(0, 30),
        tokenEnd: token.substring(token.length - 30),
        tokenLength: token.length,
        parts: token.split('.').length,
      });
    } else if (!token) {
      console.warn('[PaymentClient] No token available for request to:', config.url);
    }
    return config;
  },
  (error: AxiosError) => Promise.reject(error),
);

paymentClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const refreshToken = getRefreshToken();
      console.log('[PaymentClient] 401 received on', originalRequest.url, '| Attempting refresh. RefreshToken available?', !!refreshToken, '| RefreshToken length:', refreshToken?.length || 0);

      if (refreshToken) {
        try {
          // Wait for any existing refresh to complete, or start a new one
          if (!refreshPromise) {
            console.log('[PaymentClient] Starting new token refresh...');
            refreshPromise = (async () => {
              try {
                console.log('[PaymentClient] Calling refresh endpoint:', `${AUTH_API_BASE_URL}/api/v1/auth/refresh`);
                console.log('[PaymentClient] Refresh token details:', {
                  length: refreshToken.length,
                  parts: refreshToken.split('.').length,
                  start: refreshToken.substring(0, 30),
                  end: refreshToken.substring(refreshToken.length - 30),
                });

                // Refresh lives on the main API, not the payment service.
                const response = await axios.post(
                  `${AUTH_API_BASE_URL}/api/v1/auth/refresh`,
                  { token: refreshToken },
                );

                console.log('[PaymentClient] Refresh endpoint returned:', response.status, response.statusText);

                const { token, refreshToken: newRefreshToken } = response.data.data;
                console.log('[PaymentClient] Refresh successful, new token received:', {
                  newTokenLength: token?.length,
                  newRefreshTokenLength: newRefreshToken?.length,
                });
                setTokens(token, newRefreshToken);
              } catch (refreshError) {
                const status = (refreshError as any)?.response?.status;
                const data = (refreshError as any)?.response?.data;
                console.error('[PaymentClient] Token refresh failed:', {
                  status,
                  statusText: (refreshError as any)?.response?.statusText,
                  data,
                  message: (refreshError as any)?.message,
                });
                clearTokens();
                console.warn('[PaymentClient] Tokens cleared after refresh failure');
                throw refreshError;
              }
            })();
          } else {
            console.log('[PaymentClient] Waiting for existing token refresh...');
          }

          // Wait for refresh to complete
          await refreshPromise;
          refreshPromise = null;

          // Get the new token after refresh
          const newToken = getAccessToken();
          if (newToken && originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
          }
          console.log('[PaymentClient] Retrying original request with new token');
          return paymentClient(originalRequest);
        } catch (refreshError) {
          refreshPromise = null;
          return Promise.reject(refreshError);
        }
      } else {
        console.warn('[PaymentClient] 401 received but no refreshToken available');
      }
    }

    // Log all errors for debugging
    if (error.response?.status === 401) {
      console.error('[PaymentClient] 401 Error details:', {
        url: originalRequest.url,
        status: error.response.status,
        statusText: error.response.statusText,
        data: error.response.data,
        headers: error.response.headers,
      });
    }

    return Promise.reject(error);
  },
);

export default paymentClient;
