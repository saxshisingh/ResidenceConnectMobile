import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import en from '../locales/en';
import fr from '../locales/fr';
import ar from '../locales/ar';

export type LanguageCode = 'en' | 'fr' | 'ar';

type Dictionary = Record<string, any>;

type I18nContextValue = {
  language: LanguageCode;
  isReady: boolean;
  setLanguage: (nextLanguage: LanguageCode) => Promise<void>;
  t: (key: string, fallback?: string) => string;
};

const STORAGE_KEY = 'appLanguageCode';

const dictionaries: Record<LanguageCode, Dictionary> = {
  en,
  fr,
  ar,
};
let currentLanguage: LanguageCode = 'en';

const I18nContext = createContext<I18nContextValue | undefined>(undefined);

const getByPath = (source: Dictionary, path: string): unknown => {
  if (!path) return undefined;
  return path.split('.').reduce<unknown>((current, segment) => {
    if (!current || typeof current !== 'object') return undefined;
    return (current as Record<string, unknown>)[segment];
  }, source);
};

const normalizeLiteral = (value: string) => value.replace(/\s+/g, ' ').trim();

const flattenStringValues = (source: Dictionary, prefix = ''): Record<string, string> => {
  const result: Record<string, string> = {};
  Object.entries(source).forEach(([key, value]) => {
    const nextPath = prefix ? `${prefix}.${key}` : key;
    if (typeof value === 'string') {
      result[nextPath] = value;
      return;
    }
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      Object.assign(result, flattenStringValues(value as Dictionary, nextPath));
    }
  });
  return result;
};

const englishFlat = flattenStringValues(dictionaries.en);
const literalToKey = new Map<string, string>();
Object.entries(englishFlat).forEach(([key, value]) => {
  const normalized = normalizeLiteral(value);
  if (normalized && !literalToKey.has(normalized)) {
    literalToKey.set(normalized, key);
  }
});

const translateFromKey = (
  language: LanguageCode,
  key: string,
  fallback?: string,
): string => {
  const currentDict = dictionaries[language] || dictionaries.en;
  const translated = getByPath(currentDict, key);
  if (typeof translated === 'string' && translated.length > 0) {
    return translated;
  }

  const translatedFromCommon = getByPath(currentDict, `common.${key}`);
  if (typeof translatedFromCommon === 'string' && translatedFromCommon.length > 0) {
    return translatedFromCommon;
  }

  const english = getByPath(dictionaries.en, key);
  if (typeof english === 'string' && english.length > 0) {
    return english;
  }

  const englishFromCommon = getByPath(dictionaries.en, `common.${key}`);
  if (typeof englishFromCommon === 'string' && englishFromCommon.length > 0) {
    return englishFromCommon;
  }

  return fallback || key;
};

export const translateLiteral = (literal: string): string => {
  if (typeof literal !== 'string') return literal as unknown as string;
  const normalized = normalizeLiteral(literal);
  if (!normalized) return literal;

  const key = literalToKey.get(normalized);
  if (!key) return literal;
  return translateFromKey(currentLanguage, key, literal);
};

export const getCurrentLanguage = () => currentLanguage;

export function I18nProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<LanguageCode>('en');
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const bootstrap = async () => {
      try {
        const saved = await AsyncStorage.getItem(STORAGE_KEY);
        if (saved === 'en' || saved === 'fr' || saved === 'ar') {
          currentLanguage = saved;
          setLanguageState(saved);
        }
      } finally {
        setIsReady(true);
      }
    };

    bootstrap();
  }, []);

  const setLanguage = useCallback(async (nextLanguage: LanguageCode) => {
    currentLanguage = nextLanguage;
    setLanguageState(nextLanguage);
    await AsyncStorage.setItem(STORAGE_KEY, nextLanguage);
  }, []);

  const t = useCallback(
    (key: string, fallback?: string) => translateFromKey(language, key, fallback),
    [language]
  );

  const value = useMemo(
    () => ({
      language,
      isReady,
      setLanguage,
      t,
    }),
    [isReady, language, setLanguage, t]
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used inside I18nProvider');
  }
  return context;
}
