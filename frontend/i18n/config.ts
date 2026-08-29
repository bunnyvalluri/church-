/**
 * i18n Configuration — Kingdom of Christ Ministries Portal
 *
 * Defines supported languages, metadata, default fallback language,
 * text direction (LTR), and regional formatting locales.
 */

export const SUPPORTED_LANGUAGES = ['en', 'te', 'hi'] as const;

export type Language = (typeof SUPPORTED_LANGUAGES)[number];

export const DEFAULT_LANGUAGE: Language = 'en';

export interface LanguageMeta {
  code: Language;
  label: string;
  nativeName: string;
  short: string;
  dir: 'ltr' | 'rtl';
  locale: string;
  fontFamily: string;
}

export const LANGUAGE_METADATA: Record<Language, LanguageMeta> = {
  en: {
    code: 'en',
    label: 'English',
    nativeName: 'English',
    short: 'EN',
    dir: 'ltr',
    locale: 'en-IN',
    fontFamily: 'var(--font-inter), var(--font-outfit), sans-serif',
  },
  te: {
    code: 'te',
    label: 'Telugu',
    nativeName: 'తెలుగు',
    short: 'TE',
    dir: 'ltr',
    locale: 'te-IN',
    fontFamily: '"Noto Sans Telugu", var(--font-inter), sans-serif',
  },
  hi: {
    code: 'hi',
    label: 'Hindi',
    nativeName: 'हिंदी',
    short: 'HI',
    dir: 'ltr',
    locale: 'hi-IN',
    fontFamily: '"Noto Sans Devanagari", var(--font-inter), sans-serif',
  },
};

export const LOCALE_MAP: Record<Language, string> = {
  en: 'en-IN',
  te: 'te-IN',
  hi: 'hi-IN',
};

export function isValidLanguage(code: unknown): code is Language {
  return typeof code === 'string' && SUPPORTED_LANGUAGES.includes(code as Language);
}
