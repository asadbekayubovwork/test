/**
 * Telegram Mini App SDK Integration
 *
 * This module provides utilities for integrating with Telegram Mini App SDK.
 * For now, it provides mock functionality that works in development.
 * In production, it will use the actual Telegram SDK.
 */

// Check if we're running inside Telegram
export const isTelegramWebApp = (): boolean => {
  return typeof window !== 'undefined' && window.Telegram?.WebApp !== undefined;
};

// Get Telegram WebApp instance
export const getTelegramWebApp = () => {
  if (isTelegramWebApp() && window.Telegram) {
    return window.Telegram.WebApp;
  }
  return null;
};

// Initialize Telegram Mini App
export const initTelegramApp = () => {
  const webApp = getTelegramWebApp();

  if (webApp) {
    // Expand to full height
    webApp.expand();

    // Enable closing confirmation
    webApp.enableClosingConfirmation();

    // Set header color to match our theme
    webApp.setHeaderColor('#ffffff');
    webApp.setBackgroundColor('#ffffff');

    // Ready signal
    webApp.ready();

    console.log('Telegram Mini App initialized');
    return true;
  }

  console.log('Running outside Telegram - using mock mode');
  return false;
};

// Get user data from Telegram
export const getTelegramUser = () => {
  const webApp = getTelegramWebApp();

  console.log(webApp?.initDataUnsafe?.user);
  if (webApp?.initDataUnsafe?.user) {
    const user = webApp.initDataUnsafe.user;
    return {
      id: user.id.toString(),
      firstName: user.first_name,
      lastName: user.last_name || '',
      username: user.username || '',
      photoUrl: user.photo_url || '',
      languageCode: user.language_code || 'en',
    };
  }

  // Return mock user for development
  return {
    id: 'dev-user-123',
    firstName: 'Dev',
    lastName: 'User',
    username: 'devuser',
    photoUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=dev',
    languageCode: 'en',
  };
};

// Haptic feedback
export const hapticFeedback = {
  impact: (style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft' = 'medium') => {
    const webApp = getTelegramWebApp();
    if (webApp?.HapticFeedback) {
      webApp.HapticFeedback.impactOccurred(style);
    }
  },
  notification: (type: 'error' | 'success' | 'warning') => {
    const webApp = getTelegramWebApp();
    if (webApp?.HapticFeedback) {
      webApp.HapticFeedback.notificationOccurred(type);
    }
  },
  selection: () => {
    const webApp = getTelegramWebApp();
    if (webApp?.HapticFeedback) {
      webApp.HapticFeedback.selectionChanged();
    }
  },
};

// Show main button
export const showMainButton = (text: string, onClick: () => void) => {
  const webApp = getTelegramWebApp();
  if (webApp?.MainButton) {
    webApp.MainButton.setText(text);
    webApp.MainButton.onClick(onClick);
    webApp.MainButton.show();
  }
};

// Hide main button
export const hideMainButton = () => {
  const webApp = getTelegramWebApp();
  if (webApp?.MainButton) {
    webApp.MainButton.hide();
  }
};

// Show back button
export const showBackButton = (onClick: () => void) => {
  const webApp = getTelegramWebApp();
  if (webApp?.BackButton) {
    webApp.BackButton.onClick(onClick);
    webApp.BackButton.show();
  }
};

// Hide back button
export const hideBackButton = () => {
  const webApp = getTelegramWebApp();
  if (webApp?.BackButton) {
    webApp.BackButton.hide();
  }
};

// Close app
export const closeApp = () => {
  const webApp = getTelegramWebApp();
  if (webApp) {
    webApp.close();
  }
};

// Open link
export const openLink = (url: string, tryInstantView = false) => {
  const webApp = getTelegramWebApp();
  if (webApp) {
    webApp.openLink(url, { try_instant_view: tryInstantView });
  } else {
    window.open(url, '_blank');
  }
};

// TypeScript declaration for Telegram WebApp
declare global {
  interface Window {
    Telegram?: {
      WebApp: {
        initData: string;
        initDataUnsafe: {
          user?: {
            id: number;
            first_name: string;
            last_name?: string;
            username?: string;
            photo_url?: string;
            language_code?: string;
          };
        };
        ready: () => void;
        expand: () => void;
        close: () => void;
        enableClosingConfirmation: () => void;
        setHeaderColor: (color: string) => void;
        setBackgroundColor: (color: string) => void;
        openLink: (url: string, options?: { try_instant_view?: boolean }) => void;
        MainButton: {
          text: string;
          isVisible: boolean;
          show: () => void;
          hide: () => void;
          setText: (text: string) => void;
          onClick: (callback: () => void) => void;
        };
        BackButton: {
          isVisible: boolean;
          show: () => void;
          hide: () => void;
          onClick: (callback: () => void) => void;
        };
        HapticFeedback: {
          impactOccurred: (style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft') => void;
          notificationOccurred: (type: 'error' | 'success' | 'warning') => void;
          selectionChanged: () => void;
        };
      };
    };
  }
}

export {};
