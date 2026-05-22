import { useEffect, useState, useCallback } from 'react';
import {
  initTelegramApp,
  getTelegramUser,
  hapticFeedback,
  showMainButton,
  hideMainButton,
  showBackButton,
  hideBackButton,
  isTelegramWebApp,
} from '../telegram';

export interface TelegramUser {
  id: string;
  firstName: string;
  lastName: string;
  username: string;
  photoUrl: string;
  languageCode: string;
}

export const useTelegram = () => {
  const [isReady, setIsReady] = useState(false);
  const [user, setUser] = useState<TelegramUser | null>(null);
  const [isTelegram, setIsTelegram] = useState(false);

  useEffect(() => {
    const initialized = initTelegramApp();
    if (initialized) {
      console.log('Telegram WebApp initialized successfully');
    }
    queueMicrotask(() => {
      setIsTelegram(isTelegramWebApp());
      setUser(getTelegramUser());
      setIsReady(true);
    });
  }, []);

  const vibrate = useCallback((type: 'light' | 'medium' | 'heavy' = 'medium') => {
    hapticFeedback.impact(type);
  }, []);

  const notifySuccess = useCallback(() => {
    hapticFeedback.notification('success');
  }, []);

  const notifyError = useCallback(() => {
    hapticFeedback.notification('error');
  }, []);

  const notifyWarning = useCallback(() => {
    hapticFeedback.notification('warning');
  }, []);

  const selectionChanged = useCallback(() => {
    hapticFeedback.selection();
  }, []);

  return {
    isReady,
    user,
    isTelegram,
    vibrate,
    notifySuccess,
    notifyError,
    notifyWarning,
    selectionChanged,
    showMainButton,
    hideMainButton,
    showBackButton,
    hideBackButton,
  };
};

export default useTelegram;
