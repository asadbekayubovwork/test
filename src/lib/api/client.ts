import axios, { type AxiosInstance, type AxiosError, type InternalAxiosRequestConfig } from 'axios';

import { viteApiBaseUrl, viteMiniappClientKey } from '../env';

/** api-wordzen: курсы и аутентификация. */
const API_BASE_URL = viteApiBaseUrl();

const ACCESS_TOKEN_KEY = 'wordzen_access_token';
const REFRESH_TOKEN_KEY = 'wordzen_refresh_token';

const MINIAPP_CLIENT_KEY = viteMiniappClientKey();

/** Queue for token refresh to prevent concurrent refresh attempts. */
let refreshPromise: Promise<void> | null = null;

export const getMiniappClientKey = (): string => MINIAPP_CLIENT_KEY;

const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'X-Client-Key': MINIAPP_CLIENT_KEY,
  },
  timeout: 30000,
});

export const getAccessToken = (): string | null => {
  return localStorage.getItem(ACCESS_TOKEN_KEY);
};

export const getRefreshToken = (): string | null => {
  return localStorage.getItem(REFRESH_TOKEN_KEY);
};

export const setTokens = (accessToken: string, refreshToken: string): void => {
  localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
};

export const clearTokens = (): void => {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
};

export const isAuthenticated = (): boolean => {
  return !!getAccessToken();
};

apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getAccessToken();
    console.log('[API Client] Request to:', config.url, '| Token available?', !!token, '| Token length:', token?.length || 0);

    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('[API Client] Authorization header set:', {
        tokenStart: token.substring(0, 30),
        tokenEnd: token.substring(token.length - 30),
        tokenLength: token.length,
        parts: token.split('.').length,
      });
    } else if (!token) {
      console.warn('[API Client] No token available for request to:', config.url);
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const refreshToken = getRefreshToken();
      console.log('[API Client] 401 received on', originalRequest.url, '| Attempting refresh. RefreshToken available?', !!refreshToken, '| RefreshToken length:', refreshToken?.length || 0);

      if (refreshToken) {
        try {
          // Wait for any existing refresh to complete, or start a new one
          if (!refreshPromise) {
            console.log('[API Client] Starting new token refresh...');
            refreshPromise = (async () => {
              try {
                console.log('[API Client] Calling refresh endpoint:', `${API_BASE_URL}/api/v1/auth/refresh`);
                console.log('[API Client] Refresh token details:', {
                  length: refreshToken.length,
                  parts: refreshToken.split('.').length,
                  start: refreshToken.substring(0, 30),
                  end: refreshToken.substring(refreshToken.length - 30),
                });

                const response = await axios.post(`${API_BASE_URL}/api/v1/auth/refresh`, {
                  token: refreshToken,
                });

                console.log('[API Client] Refresh endpoint returned:', response.status, response.statusText);

                const { token, refreshToken: newRefreshToken } = response.data.data;
                console.log('[API Client] Refresh successful, new token received:', {
                  newTokenLength: token?.length,
                  newRefreshTokenLength: newRefreshToken?.length,
                });
                setTokens(token, newRefreshToken);
              } catch (refreshError) {
                const status = (refreshError as any)?.response?.status;
                const data = (refreshError as any)?.response?.data;
                console.error('[API Client] Token refresh failed:', {
                  status,
                  statusText: (refreshError as any)?.response?.statusText,
                  data,
                  message: (refreshError as any)?.message,
                });
                clearTokens();
                console.warn('[API Client] Tokens cleared after refresh failure');
                throw refreshError;
              }
            })();
          } else {
            console.log('[API Client] Waiting for existing token refresh...');
          }

          // Wait for refresh to complete
          await refreshPromise;
          refreshPromise = null;

          // Get the new token after refresh
          const newToken = getAccessToken();
          if (newToken && originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
          }
          console.log('[API Client] Retrying original request with new token');
          return apiClient(originalRequest);
        } catch (refreshError) {
          refreshPromise = null;
          return Promise.reject(refreshError);
        }
      } else {
        console.warn('[API Client] 401 received but no refreshToken available');
      }
    }

    // Log all errors for debugging
    if (error.response?.status === 401) {
      console.error('[API Client] 401 Error details:', {
        url: originalRequest.url,
        status: error.response.status,
        statusText: error.response.statusText,
        data: error.response.data,
        headers: error.response.headers,
      });
    }

    return Promise.reject(error);
  }
);

export default apiClient;
