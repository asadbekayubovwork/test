import type { TelegramWebApp } from './types';

export const getTelegramWebApp = (): TelegramWebApp | undefined => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (window as any).Telegram?.WebApp as TelegramWebApp | undefined;
};
