import { DEFAULT_LANGUAGE, isValidLanguage, Language, LANGUAGE_METADATA, LanguageMeta } from '../config';

const STORAGE_KEY = 'language';
const COOKIE_NAME = 'kcm-lang';
const LANGUAGE_CHANGE_EVENT = 'kcm-language-change';

/**
 * Detect the initial language from localStorage, document cookie, or navigator.
 * Fully SSR-safe (returns DEFAULT_LANGUAGE on server).
 */
export function detectUserLanguage(): Language {
  if (typeof window === 'undefined') {
    return DEFAULT_LANGUAGE;
  }

  try {
    // 1. Check LocalStorage
    const stored = localStorage.getItem(STORAGE_KEY);
    if (isValidLanguage(stored)) {
      return stored;
    }

    // 2. Check Cookie
    if (typeof document !== 'undefined') {
      const match = document.cookie.match(new RegExp(`(?:^|; )${COOKIE_NAME}=([a-z]{2})`));
      if (match && isValidLanguage(match[1])) {
        return match[1];
      }

      // 3. Check Browser Languages
      if (navigator.language) {
        const browserLang = navigator.language.toLowerCase();
        if (browserLang.startsWith('te')) return 'te';
        if (browserLang.startsWith('hi')) return 'hi';
        if (browserLang.startsWith('en')) return 'en';
      }
    }
  } catch (err) {
    console.warn('[i18n] Error detecting user language:', err);
  }

  return DEFAULT_LANGUAGE;
}

/**
 * Persist the selected language across localStorage, cookie, HTML attribute,
 * and dispatch a custom DOM event for instant multi-tab/multi-component sync.
 */
export function persistLanguage(lang: Language): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(STORAGE_KEY, lang);
    if (typeof document !== 'undefined') {
      document.cookie = `${COOKIE_NAME}=${lang};path=/;max-age=31536000;SameSite=Lax`;
      applyDocumentLanguage(lang);
      window.dispatchEvent(new CustomEvent(LANGUAGE_CHANGE_EVENT, { detail: lang }));
    }
  } catch (err) {
    console.warn('[i18n] Could not persist language selection:', err);
  }
}

/**
 * Updates HTML tag attributes for SEO and accessibility
 */
export function applyDocumentLanguage(lang: Language): void {
  if (typeof document === 'undefined') return;
  document.documentElement.lang = lang;
  document.documentElement.dir = LANGUAGE_METADATA[lang]?.dir || 'ltr';
}

export function getLanguageMetadata(lang: Language): LanguageMeta {
  return LANGUAGE_METADATA[lang] || LANGUAGE_METADATA[DEFAULT_LANGUAGE];
}

export { LANGUAGE_CHANGE_EVENT };
