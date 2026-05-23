import { useEffect, useState, useCallback, type ReactNode } from 'react';

import { loginWithTelegram } from '../api/auth';
import { isAuthenticated } from '../api/client';

import { TelegramContext } from './context';
import { getTelegramWebApp } from './telegramWebApp';
import type {
  TelegramWebApp,
  TelegramUser,
  TelegramContextType,
} from './types';

export const TelegramProvider = ({ children }: { children: ReactNode }) => {
  const [webApp, setWebApp] = useState<TelegramWebApp | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const authenticateWithTelegram = useCallback(async (initData: string) => {
    console.log('[TG Auth] Starting authentication...');
    console.log('[TG Auth] initData length:', initData.length);
    console.log('[TG Auth] initData preview:', initData.substring(0, 100) + '...');

    try {
      const params = new URLSearchParams(initData);
      const parsed: Record<string, string> = {};
      params.forEach((value, key) => {
        parsed[key] = key === 'hash' ? `${value.substring(0, 10)}...` : value.substring(0, 60);
      });
      console.log('[TG Auth] initData parsed:', parsed);
    } catch (e) {
      console.warn('[TG Auth] Could not parse initData:', e);
    }

    setIsAuthenticating(true);
    setAuthError(null);

    try {
      const result = await loginWithTelegram(initData);
      console.log('[TG Auth] Authentication successful!', result);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Authentication failed';
      console.error('[TG Auth] Authentication failed:', message);
      console.error('[TG Auth] Full error:', error);
      setAuthError(message);
    } finally {
      setIsAuthenticating(false);
    }
  }, []);

  const reAuthenticate = useCallback(async () => {
    const tgWebApp = getTelegramWebApp();
    if (tgWebApp?.initData) {
      console.log('[TG Auth] Re-authenticating...');
      await authenticateWithTelegram(tgWebApp.initData);
    } else {
      console.log('[TG Auth] Cannot re-authenticate - no initData available');
    }
  }, [authenticateWithTelegram]);

  useEffect(() => {
    const tgWebApp = getTelegramWebApp();

    if (tgWebApp) {
      setWebApp(tgWebApp);

      tgWebApp.ready();
      tgWebApp.expand();
      tgWebApp.setHeaderColor('#ffffff');
      tgWebApp.setBackgroundColor('#f9fafb');

      console.log('Telegram WebApp initialized:', {
        user: tgWebApp.initDataUnsafe.user,
        platform: tgWebApp.platform,
        version: tgWebApp.version,
        colorScheme: tgWebApp.colorScheme,
      });

      if (tgWebApp.initData) {
        console.log('[TG Auth] initData found, checking auth status...');

        if (!isAuthenticated()) {
          console.log('[TG Auth] Not authenticated, starting authentication...');
          authenticateWithTelegram(tgWebApp.initData).finally(() => {
            setIsReady(true);
          });
        } else {
          console.log('[TG Auth] Already authenticated');
          setIsReady(true);
        }
      } else {
        console.log('[TG Auth] No initData available - running outside Telegram or in test mode');
        setIsReady(true);
      }
    } else {
      setIsReady(true);
      console.log('Not running in Telegram WebApp');
    }
  }, [authenticateWithTelegram]);

  const isTelegram = !!webApp;
  const user: TelegramUser | null = webApp?.initDataUnsafe.user ?? null;
  const colorScheme = webApp?.colorScheme || 'light';
  const themeParams = webApp?.themeParams || {};

  const haptic = {
    impact: (style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft' = 'medium') => {
      webApp?.HapticFeedback.impactOccurred(style);
    },
    notification: (type: 'error' | 'success' | 'warning' = 'success') => {
      webApp?.HapticFeedback.notificationOccurred(type);
    },
    selection: () => {
      webApp?.HapticFeedback.selectionChanged();
    },
  };

  const showBackButton = () => {
    webApp?.BackButton.show();
  };

  const hideBackButton = () => {
    webApp?.BackButton.hide();
  };

  const setBackButtonCallback = (callback: () => void) => {
    if (webApp) {
      webApp.BackButton.onClick(callback);
    }
  };

  const value: TelegramContextType = {
    webApp,
    user,
    colorScheme,
    themeParams,
    isReady,
    isTelegram,
    isAuthenticating,
    authError,
    haptic,
    showBackButton,
    hideBackButton,
    setBackButtonCallback,
    reAuthenticate,
  };

  return (
    <TelegramContext.Provider value={value}>
      {children}
    </TelegramContext.Provider>
  );
};
