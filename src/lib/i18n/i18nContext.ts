import { createContext } from 'react';

import type { UILanguage } from '../../types';

import type { TranslationKey } from './translationKeys';

export interface I18nContextValue {
  t: (key: TranslationKey, params?: Record<string, string | number>) => string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ta: (key: TranslationKey) => readonly any[];
  language: UILanguage;
  setLanguage: (lang: UILanguage) => void;
}

export const I18nContext = createContext<I18nContextValue | null>(null);
