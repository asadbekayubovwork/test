import apiClient, { setTokens, clearTokens, getAccessToken, getRefreshToken } from './client';
import { type WordzenApiResponse, wordzenErrorMessage } from './wordzenEnvelope';

// Types (wordzen-api.md § «Аутентификация» / модели)
export interface TokenDto {
  token: string;
  refreshToken: string;
  expireAt?: string;
  createdAt?: string;
  userUid?: string;
}

export interface RoleView {
  name: string;
  code: 'ROLE_USER' | 'ROLE_AUTHOR';
}

export interface UserView {
  uid: string;
  username: string;
  roles: RoleView[];
}

export interface TelegramLoginRequest {
  initData: string;
}

export interface UserLoginRequest {
  email: string;
  password: string;
}

export interface UserRegistrationRequest {
  email: string;
  password: string;
  confirmationCode?: string;
  idempotencyKey: string;
}

export interface TokenRequest {
  token: string;
}

export interface GoogleTokenRequest {
  idToken: string;
}

export type EmailConfirmationType = 'REGISTRATION' | 'CHANGE_PASSWORD';

export interface EmailConfirmationRequest {
  email: string;
  idempotencyKey: string;
  type: EmailConfirmationType;
}

/** Ответ `ApiResponse<NoContentView>`: `data.message` опционален */
export type NoContentView = { message?: string };

export interface RegisterEmailParams {
  email: string;
  password: string;
  /** Если регистрация с подтверждением email — код из письма */
  confirmationCode?: string;
  /** По умолчанию `crypto.randomUUID()` */
  idempotencyKey?: string;
  /** Query `withoutConfirmation` — см. wordzen-api.md */
  withoutConfirmation?: boolean;
}

function newIdempotencyKey(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

// Auth API functions

/**
 * Login with Telegram initData
 * This is the primary authentication method for Telegram Mini App
 */
export const loginWithTelegram = async (initData: string): Promise<TokenDto> => {
  try {
    const response = await apiClient.post<WordzenApiResponse<TokenDto>>('/api/v1/auth/telegram/login', {
      initData,
    });

    if (response.data.success && response.data.data) {
      const { token, refreshToken } = response.data.data;
      setTokens(token, refreshToken);
      return response.data.data;
    }

    throw new Error(wordzenErrorMessage(response.data, 'Telegram login failed'));
  } catch (err: any) {
    if (err.response?.data) {
      throw new Error(wordzenErrorMessage(err.response.data, 'Telegram login failed'));
    }
    throw err;
  }
};

/**
 * Login with email and password
 */
export const loginWithEmail = async (email: string, password: string): Promise<TokenDto> => {
  try {
    const response = await apiClient.post<WordzenApiResponse<TokenDto>>('/api/v1/auth/login', {
      email,
      password,
    });

    if (response.data.success && response.data.data) {
      const { token, refreshToken } = response.data.data;
      setTokens(token, refreshToken);
      return response.data.data;
    }

    throw new Error(wordzenErrorMessage(response.data, 'Login failed'));
  } catch (err: any) {
    if (err.response?.data) {
      throw new Error(wordzenErrorMessage(err.response.data, 'Login failed'));
    }
    throw err;
  }
};

/**
 * Регистрация по email (см. `UserRegistrationRequest` + query `withoutConfirmation`).
 */
export const registerWithEmail = async (params: RegisterEmailParams): Promise<TokenDto> => {
  try {
    const idempotencyKey = params.idempotencyKey ?? newIdempotencyKey();
    const body: UserRegistrationRequest = {
      email: params.email,
      password: params.password,
      idempotencyKey,
      ...(params.confirmationCode != null && params.confirmationCode !== ''
        ? { confirmationCode: params.confirmationCode }
        : {}),
    };

    console.log('[Auth] Registering with email:', {
      email: params.email,
      withoutConfirmation: params.withoutConfirmation,
      idempotencyKey,
    });

    const response = await apiClient.post<WordzenApiResponse<TokenDto>>(
      '/api/v1/auth/registration',
      body,
      {
        params:
          params.withoutConfirmation === undefined
            ? undefined
            : { withoutConfirmation: params.withoutConfirmation },
      }
    );

    if (response.data.success && response.data.data) {
      const { token, refreshToken } = response.data.data;
      console.log('[Auth] Registration response received:', {
        tokenLength: token?.length,
        tokenParts: token?.split('.').length,
        tokenStart: token?.substring(0, 30),
        tokenEnd: token?.substring((token?.length || 0) - 30),
        refreshTokenLength: refreshToken?.length,
        refreshTokenParts: refreshToken?.split('.').length,
        refreshTokenStart: refreshToken?.substring(0, 30),
        refreshTokenEnd: refreshToken?.substring((refreshToken?.length || 0) - 30),
      });

      console.log('[Auth] Calling setTokens...');
      setTokens(token, refreshToken);

      const savedToken = getAccessToken();
      const savedRefreshToken = getRefreshToken();

      console.log('[Auth] Tokens verified after saving:', {
        accessTokenLength: savedToken?.length,
        accessTokenParts: savedToken?.split('.').length,
        refreshTokenLength: savedRefreshToken?.length,
        refreshTokenParts: savedRefreshToken?.split('.').length,
        accessTokenValid: savedToken?.split('.').length === 3,
        refreshTokenValid: savedRefreshToken?.split('.').length === 3,
      });

      return response.data.data;
    }

    throw new Error(wordzenErrorMessage(response.data, 'Registration failed'));
  } catch (err: any) {
    if (err.response?.data) {
      throw new Error(wordzenErrorMessage(err.response.data, 'Registration failed'));
    }
    throw err;
  }
};

/**
 * `POST /api/v1/auth/google/login`
 */
export const loginWithGoogle = async (idToken: string): Promise<TokenDto> => {
  try {
    const response = await apiClient.post<WordzenApiResponse<TokenDto>>('/api/v1/auth/google/login', {
      idToken,
    });

    if (response.data.success && response.data.data) {
      const { token, refreshToken } = response.data.data;
      setTokens(token, refreshToken);
      return response.data.data;
    }

    throw new Error(wordzenErrorMessage(response.data, 'Google login failed'));
  } catch (err: any) {
    if (err.response?.data) {
      throw new Error(wordzenErrorMessage(err.response.data, 'Google login failed'));
    }
    throw err;
  }
};

/**
 * `POST /api/v1/auth/change_password` (тело как у регистрации в контракте).
 */
export const changePassword = async (body: UserRegistrationRequest): Promise<void> => {
  try {
    const response = await apiClient.post<WordzenApiResponse<NoContentView | null>>(
      '/api/v1/auth/change_password',
      body
    );

    if (response.data.success) {
      return;
    }

    throw new Error(wordzenErrorMessage(response.data, 'Password change failed'));
  } catch (err: any) {
    if (err.response?.data) {
      throw new Error(wordzenErrorMessage(err.response.data, 'Password change failed'));
    }
    throw err;
  }
};

/**
 * Запрос кода подтверждения на email (`POST /api/v1/auth/confirmation`).
 */
export const requestAuthEmailConfirmation = async (
  email: string,
  type: EmailConfirmationType,
  idempotencyKey?: string
): Promise<void> => {
  try {
    const payload: EmailConfirmationRequest = {
      email,
      idempotencyKey: idempotencyKey ?? newIdempotencyKey(),
      type,
    };
    const response = await apiClient.post<WordzenApiResponse<NoContentView | null>>(
      '/api/v1/auth/confirmation',
      payload
    );

    if (response.data.success) {
      return;
    }

    throw new Error(wordzenErrorMessage(response.data, 'Confirmation request failed'));
  } catch (err: any) {
    if (err.response?.data) {
      throw new Error(wordzenErrorMessage(err.response.data, 'Confirmation request failed'));
    }
    throw err;
  }
};

/**
 * `POST /api/v1/auth/reset` — в контракте `TokenRequest` (какой именно токен уточнять у бэка).
 */
export const authReset = async (token: string): Promise<void> => {
  try {
    const response = await apiClient.post<WordzenApiResponse<NoContentView | null>>('/api/v1/auth/reset', {
      token,
    });

    if (response.data.success) {
      return;
    }

    throw new Error(wordzenErrorMessage(response.data, 'Reset failed'));
  } catch (err: any) {
    if (err.response?.data) {
      throw new Error(wordzenErrorMessage(err.response.data, 'Reset failed'));
    }
    throw err;
  }
};

/**
 * Get current user info
 */
export const getCurrentUser = async (): Promise<UserView> => {
  try {
    const token = getAccessToken();
    if (!token) {
      throw new Error('Not authenticated');
    }

    const response = await apiClient.post<WordzenApiResponse<UserView>>('/api/v1/auth', {
      token,
    });

    if (response.data.success && response.data.data) {
      return response.data.data;
    }

    throw new Error(wordzenErrorMessage(response.data, 'Failed to get user'));
  } catch (err: any) {
    if (err.response?.data) {
      throw new Error(wordzenErrorMessage(err.response.data, 'Failed to get user'));
    }
    throw err;
  }
};

/**
 * Refresh access token
 */
export const refreshAccessToken = async (refreshToken: string): Promise<TokenDto> => {
  try {
    const response = await apiClient.post<WordzenApiResponse<TokenDto>>('/api/v1/auth/refresh', {
      token: refreshToken,
    });

    if (response.data.success && response.data.data) {
      const { token, refreshToken: newRefreshToken } = response.data.data;
      setTokens(token, newRefreshToken);
      return response.data.data;
    }

    throw new Error(wordzenErrorMessage(response.data, 'Token refresh failed'));
  } catch (err: any) {
    if (err.response?.data) {
      throw new Error(wordzenErrorMessage(err.response.data, 'Token refresh failed'));
    }
    throw err;
  }
};

/**
 * Logout - clear tokens locally
 * Note: The API doesn't have a logout endpoint, so we just clear tokens locally.
 * This is common for JWT-based auth since tokens are stateless.
 */
export const logout = async (): Promise<void> => {
  // Simply clear tokens from local storage
  // No API call needed since JWT tokens are stateless
  clearTokens();
};

/**
 * Check if user is authenticated
 */
export const checkAuth = (): boolean => {
  return !!getAccessToken();
};
