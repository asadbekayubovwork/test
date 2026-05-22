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
import { viteAccountApiBaseUrl, viteApiBaseUrl } from '../env';

/** Account service: аккаунт (коины, подписка в составе аккаунта), друзья, рейтинги — см. Swagger account-wordzen. */
const ACCOUNT_API_BASE_URL = viteAccountApiBaseUrl();
/** Обновление токена живёт на api-wordzen (курсы + auth). */
const AUTH_API_BASE_URL = viteApiBaseUrl();

/** Queue for token refresh to prevent concurrent refresh attempts. */
let refreshPromise: Promise<void> | null = null;

const accountClient: AxiosInstance = axios.create({
  baseURL: ACCOUNT_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'X-Client-Key': getMiniappClientKey(),
  },
  timeout: 30000,
});

accountClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getAccessToken();
    console.log('[AccountClient] Request to:', config.url, '| Token available?', !!token, '| Token length:', token?.length || 0);

    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('[AccountClient] Authorization header set:', {
        tokenStart: token.substring(0, 30),
        tokenEnd: token.substring(token.length - 30),
        tokenLength: token.length,
        parts: token.split('.').length,
      });
    } else if (!token) {
      console.warn('[AccountClient] No token available for request to:', config.url);
    }
    return config;
  },
  (error: AxiosError) => Promise.reject(error),
);

accountClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const refreshToken = getRefreshToken();
      console.log('[AccountClient] 401 received on', originalRequest.url, '| Attempting refresh. RefreshToken available?', !!refreshToken, '| RefreshToken length:', refreshToken?.length || 0);

      if (refreshToken) {
        try {
          // Wait for any existing refresh to complete, or start a new one
          if (!refreshPromise) {
            console.log('[AccountClient] Starting new token refresh...');
            refreshPromise = (async () => {
              try {
                console.log('[AccountClient] Calling refresh endpoint:', `${AUTH_API_BASE_URL}/api/v1/auth/refresh`);
                console.log('[AccountClient] Refresh token details:', {
                  length: refreshToken.length,
                  parts: refreshToken.split('.').length,
                  start: refreshToken.substring(0, 30),
                  end: refreshToken.substring(refreshToken.length - 30),
                });

                const response = await axios.post(
                  `${AUTH_API_BASE_URL}/api/v1/auth/refresh`,
                  { token: refreshToken },
                );

                console.log('[AccountClient] Refresh endpoint returned:', response.status, response.statusText);

                const { token, refreshToken: newRefreshToken } = response.data.data;
                console.log('[AccountClient] Refresh successful, new token received:', {
                  newTokenLength: token?.length,
                  newRefreshTokenLength: newRefreshToken?.length,
                });
                setTokens(token, newRefreshToken);
              } catch (refreshError) {
                const status = (refreshError as any)?.response?.status;
                const data = (refreshError as any)?.response?.data;
                console.error('[AccountClient] Token refresh failed:', {
                  status,
                  statusText: (refreshError as any)?.response?.statusText,
                  data,
                  message: (refreshError as any)?.message,
                });
                clearTokens();
                console.warn('[AccountClient] Tokens cleared after refresh failure');
                throw refreshError;
              }
            })();
          } else {
            console.log('[AccountClient] Waiting for existing token refresh...');
          }

          // Wait for refresh to complete
          await refreshPromise;
          refreshPromise = null;

          // Get the new token after refresh
          const newToken = getAccessToken();
          if (newToken && originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
          }
          console.log('[AccountClient] Retrying original request with new token');
          return accountClient(originalRequest);
        } catch (refreshError) {
          refreshPromise = null;
          return Promise.reject(refreshError);
        }
      } else {
        console.warn('[AccountClient] 401 received but no refreshToken available');
      }
    }

    // Log all errors for debugging
    if (error.response?.status === 401) {
      console.error('[AccountClient] 401 Error details:', {
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

export default accountClient;
