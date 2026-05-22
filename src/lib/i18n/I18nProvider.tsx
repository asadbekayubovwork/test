import { useMemo, type ReactNode } from 'react';

import { useSettingsStore } from '../stores/settingsStore';
import type { UILanguage } from '../../types';
import en from './locales/en';
import uz from './locales/uz';
import ru from './locales/ru';
import kk from './locales/kk';
import uk from './locales/uk';

import { I18nContext } from './i18nContext';
import type { TranslationKey } from './translationKeys';

// Non-English locales are typed as `unknown` because the runtime falls back
// to English for any missing key. This lets locales lag behind the en source
// without breaking type checking.
const locales: Record<UILanguage, unknown> = { en, uz, ru, kk, uk };

function getNestedValue(obj: unknown, path: string): unknown {
  const keys = path.split('.');
  let value: unknown = obj;
  for (const k of keys) {
    if (value == null || typeof value !== 'object') return undefined;
    value = (value as Record<string, unknown>)[k];
  }
  return value;
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const uiLanguage = useSettingsStore((s) => s.uiLanguage);
  const setUILanguage = useSettingsStore((s) => s.setUILanguage);

  const translations = useMemo(() => locales[uiLanguage] ?? en, [uiLanguage]);

  const t = useMemo(() => {
    return (key: TranslationKey, params?: Record<string, string | number>): string => {
      let value = getNestedValue(translations, key);

      // Fallback to English
      if (typeof value !== 'string') {
        value = getNestedValue(en, key);
      }

      if (typeof value !== 'string') return key;

      let result = value as string;
      if (params) {
        Object.entries(params).forEach(([paramKey, paramValue]) => {
          result = result.replace(
            new RegExp(`\\{\\{${paramKey}\\}\\}`, 'g'),
            String(paramValue),
          );
        });
      }
      return result;
    };
  }, [translations]);

  // For array values (e.g., dayLabels)
  const ta = useMemo(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (key: TranslationKey): readonly any[] => {
      let value = getNestedValue(translations, key);
      if (!Array.isArray(value)) {
        value = getNestedValue(en, key);
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return Array.isArray(value) ? value : [] as readonly any[];
    };
  }, [translations]);

  return (
    <I18nContext.Provider value={{ t, ta, language: uiLanguage, setLanguage: setUILanguage }}>
      {children}
    </I18nContext.Provider>
  );
}
