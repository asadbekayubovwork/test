import { createContext } from 'react';

import type { TelegramContextType } from './types';

export const TelegramContext = createContext<TelegramContextType | null>(null);
