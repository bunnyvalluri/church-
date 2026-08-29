"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  ReactNode,
} from "react";
import {
  translations,
  Language,
  SUPPORTED_LANGUAGES,
  DEFAULT_LANGUAGE,
  LOCALE_MAP,
  detectUserLanguage,
  persistLanguage,
  applyDocumentLanguage,
  resolveKeyPath,
} from "@/i18n";

export type { Language };

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: typeof translations.en & Record<string, any>;
  translate: (keyPath: string, defaultText?: string) => string;
  formatDate: (date: Date | string | number, options?: Intl.DateTimeFormatOptions) => string;
  formatCurrency: (amount: number, currency?: string) => string;
  formatNumber: (num: number) => string;
  isTelugu: boolean;
  isHindi: boolean;
  isEnglish: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>(DEFAULT_LANGUAGE);
  const [mounted, setMounted] = useState(false);

  // Initialize language from localStorage / cookies / browser detection on client mount
  useEffect(() => {
    setMounted(true);
    const initialLang = detectUserLanguage();
    setLanguage(initialLang);
    applyDocumentLanguage(initialLang);

    // Listen for custom language change event across tabs / window
    const handleCustomEvent = (e: Event) => {
      const customEvent = e as CustomEvent<Language>;
      if (
        customEvent.detail &&
        SUPPORTED_LANGUAGES.includes(customEvent.detail)
      ) {
        setLanguage(customEvent.detail);
      }
    };
    window.addEventListener("kcm-language-change", handleCustomEvent);
    return () => window.removeEventListener("kcm-language-change", handleCustomEvent);
  }, []);

  const handleSetLanguage = useCallback((lang: Language) => {
    if (!SUPPORTED_LANGUAGES.includes(lang)) return;
    setLanguage(lang);
    persistLanguage(lang);
  }, []);

  // Compute active dictionary with deep fallback to canonical English
  const activeDictionary = useMemo(() => {
    const current = translations[mounted ? language : DEFAULT_LANGUAGE] || translations.en;
    return current;
  }, [language, mounted]);

  // Dot-notation translation helper with safe English fallback and development logging
  const translate = useCallback(
    (keyPath: string, defaultText?: string): string => {
      const targetLang = mounted ? language : DEFAULT_LANGUAGE;
      const currentDict = translations[targetLang] || translations.en;
      const val = resolveKeyPath(currentDict, keyPath);
      if (val !== undefined) return val;

      // Fallback to canonical English dictionary
      if (targetLang !== "en") {
        const fallbackVal = resolveKeyPath(translations.en, keyPath);
        if (fallbackVal !== undefined) return fallbackVal;
      }

      if (process.env.NODE_ENV === "development") {
        console.warn(`[i18n] Missing translation key: "${keyPath}" for locale "${targetLang}"`);
      }

      return defaultText || keyPath;
    },
    [language, mounted]
  );

  // Locale-aware Date Formatter
  const formatDate = useCallback(
    (dateInput: Date | string | number, options?: Intl.DateTimeFormatOptions): string => {
      try {
        const d = typeof dateInput === "object" ? dateInput : new Date(dateInput);
        if (isNaN(d.getTime())) return String(dateInput);
        const locale = LOCALE_MAP[mounted ? language : DEFAULT_LANGUAGE] || "en-IN";
        const defaultOptions: Intl.DateTimeFormatOptions = options || {
          year: "numeric",
          month: "short",
          day: "numeric",
        };
        return new Intl.DateTimeFormat(locale, defaultOptions).format(d);
      } catch {
        return String(dateInput);
      }
    },
    [language, mounted]
  );

  // Locale-aware Currency Formatter (₹)
  const formatCurrency = useCallback(
    (amount: number, currency: string = "INR"): string => {
      try {
        const locale = LOCALE_MAP[mounted ? language : DEFAULT_LANGUAGE] || "en-IN";
        return new Intl.NumberFormat(locale, {
          style: "currency",
          currency,
          maximumFractionDigits: 0,
        }).format(amount);
      } catch {
        return `₹${amount.toLocaleString("en-IN")}`;
      }
    },
    [language, mounted]
  );

  // Locale-aware Number Formatter
  const formatNumber = useCallback(
    (num: number): string => {
      try {
        const locale = LOCALE_MAP[mounted ? language : DEFAULT_LANGUAGE] || "en-IN";
        return new Intl.NumberFormat(locale).format(num);
      } catch {
        return num.toLocaleString();
      }
    },
    [language, mounted]
  );

  const activeLang = mounted ? language : DEFAULT_LANGUAGE;

  const contextValue = useMemo(
    () => ({
      language: activeLang,
      setLanguage: handleSetLanguage,
      t: activeDictionary,
      translate,
      formatDate,
      formatCurrency,
      formatNumber,
      isTelugu: activeLang === "te",
      isHindi: activeLang === "hi",
      isEnglish: activeLang === "en",
    }),
    [
      activeLang,
      handleSetLanguage,
      activeDictionary,
      translate,
      formatDate,
      formatCurrency,
      formatNumber,
    ]
  );

  return (
    <LanguageContext.Provider value={contextValue}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
