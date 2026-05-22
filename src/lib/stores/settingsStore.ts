import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { UserSettings, UILanguage } from '../../types';

interface SettingsState extends UserSettings {
  theme: 'light' | 'dark' | 'system';
}

interface SettingsActions {
  setTranslationLanguage: (language: string) => void;
  setNotifications: (enabled: boolean) => void;
  setSoundEffects: (enabled: boolean) => void;
  setCountry: (country: string) => void;
  setRegion: (region: string) => void;
  setCountryAndRegion: (country: string, region: string) => void;
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  setUILanguage: (language: UILanguage) => void;
  resetSettings: () => void;
}

type SettingsStore = SettingsState & SettingsActions;

const defaultSettings: SettingsState = {
  translationLanguage: 'Russian',
  notifications: true,
  soundEffects: true,
  country: '',
  region: '',
  theme: 'light',
  uiLanguage: 'en',
};

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      ...defaultSettings,

      setTranslationLanguage: (language) =>
        set({ translationLanguage: language }),

      setNotifications: (enabled) => set({ notifications: enabled }),

      setSoundEffects: (enabled) => set({ soundEffects: enabled }),

      setCountry: (country) => set({ country }),

      setRegion: (region) => set({ region }),

      setCountryAndRegion: (country, region) => set({ country, region }),

      setTheme: (theme) => set({ theme }),

      setUILanguage: (language) => set({ uiLanguage: language }),

      resetSettings: () => set(defaultSettings),
    }),
    {
      name: 'wordzen-settings',
    }
  )
);

// Available languages for card translations
export const availableLanguages = [
  { code: 'ru', name: 'Russian', flag: '\u{1F1F7}\u{1F1FA}' },
  { code: 'es', name: 'Spanish', flag: '\u{1F1EA}\u{1F1F8}' },
  { code: 'fr', name: 'French', flag: '\u{1F1EB}\u{1F1F7}' },
  { code: 'de', name: 'German', flag: '\u{1F1E9}\u{1F1EA}' },
  { code: 'ja', name: 'Japanese', flag: '\u{1F1EF}\u{1F1F5}' },
  { code: 'zh', name: 'Chinese', flag: '\u{1F1E8}\u{1F1F3}' },
  { code: 'ko', name: 'Korean', flag: '\u{1F1F0}\u{1F1F7}' },
  { code: 'pt', name: 'Portuguese', flag: '\u{1F1F5}\u{1F1F9}' },
  { code: 'it', name: 'Italian', flag: '\u{1F1EE}\u{1F1F9}' },
  { code: 'ar', name: 'Arabic', flag: '\u{1F1F8}\u{1F1E6}' },
];

// Available UI languages for the app interface
export const uiLanguages = [
  { code: 'en' as UILanguage, name: 'English', nativeName: 'English', flag: '\u{1F1EC}\u{1F1E7}' },
  { code: 'uz' as UILanguage, name: 'Uzbek', nativeName: "O'zbek", flag: '\u{1F1FA}\u{1F1FF}' },
  { code: 'ru' as UILanguage, name: 'Russian', nativeName: '\u0420\u0443\u0441\u0441\u043A\u0438\u0439', flag: '\u{1F1F7}\u{1F1FA}' },
  { code: 'kk' as UILanguage, name: 'Kazakh', nativeName: '\u049A\u0430\u0437\u0430\u049B', flag: '\u{1F1F0}\u{1F1FF}' },
  { code: 'uk' as UILanguage, name: 'Ukrainian', nativeName: '\u0423\u043A\u0440\u0430\u0457\u043D\u0441\u044C\u043A\u0430', flag: '\u{1F1FA}\u{1F1E6}' },
];
