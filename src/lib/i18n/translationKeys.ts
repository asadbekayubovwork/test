import type { Translations } from './locales/en';

// Helper: flatten nested object keys with dot notation
type FlattenKeys<T, Prefix extends string = ''> = T extends Record<string, unknown>
  ? {
      [K in keyof T & string]: T[K] extends Record<string, unknown>
        ? FlattenKeys<T[K], `${Prefix}${K}.`>
        : T[K] extends readonly string[]
          ? `${Prefix}${K}`
          : `${Prefix}${K}`;
    }[keyof T & string]
  : never;

export type TranslationKey = FlattenKeys<Translations>;
