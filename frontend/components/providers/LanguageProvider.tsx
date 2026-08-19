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
import { translations } from "@/lib/translations";

export type Language = "en" | "te" | "hi";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: typeof translations.en;
  translate: (keyPath: string, defaultText?: string) => string;
  formatDate: (date: Date | string | number, options?: Intl.DateTimeFormatOptions) => string;
  formatCurrency: (amount: number, currency?: string) => string;
  formatNumber: (num: number) => string;
  isTelugu: boolean;
  isHindi: boolean;
  isEnglish: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const LOCALE_MAP: Record<Language, string> = {
  en: "en-IN",
  te: "te-IN",
  hi: "hi-IN",
};

/**
 * Safely resolves a dot-notation key path on a nested object with English fallback.
 */
function resolveKeyPath(obj: any, path: string): string | undefined {
  if (!obj || !path) return undefined;
  const parts = path.split(".");
  let current = obj;
  for (const part of parts) {
    if (current === undefined || current === null || typeof current !== "object") {
      return undefined;
    }
    current = current[part];
  }
  return typeof current === "string" ? current : undefined;
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>("en");
  const [mounted, setMounted] = useState(false);

  // Initialize language from localStorage, cookies, or browser preferences
  useEffect(() => {
    setMounted(true);
    let initialLang: Language = "en";

    try {
      const saved = localStorage.getItem("language") as Language;
      if (saved && (saved === "en" || saved === "te" || saved === "hi")) {
        initialLang = saved;
      } else if (typeof document !== "undefined") {
        // Fallback to cookie
        const match = document.cookie.match(/kcm-lang=([a-z]{2})/i);
        if (match && (match[1] === "en" || match[1] === "te" || match[1] === "hi")) {
          initialLang = match[1] as Language;
        } else if (typeof navigator !== "undefined" && navigator.language) {
          // Browser language detection
          const browserLang = navigator.language.toLowerCase();
          if (browserLang.startsWith("te")) initialLang = "te";
          else if (browserLang.startsWith("hi")) initialLang = "hi";
        }
      }
    } catch {
      initialLang = "en";
    }

    setLanguage(initialLang);
    if (typeof document !== "undefined") {
      document.documentElement.lang = initialLang;
    }

    // Listen for custom event across tabs or subcomponents
    const handleCustomEvent = (e: Event) => {
      const customEvent = e as CustomEvent<Language>;
      if (customEvent.detail && (customEvent.detail === "en" || customEvent.detail === "te" || customEvent.detail === "hi")) {
        setLanguage(customEvent.detail);
      }
    };
    window.addEventListener("kcm-language-change", handleCustomEvent);
    return () => window.removeEventListener("kcm-language-change", handleCustomEvent);
  }, []);

  const handleSetLanguage = useCallback((lang: Language) => {
    setLanguage(lang);
    try {
      localStorage.setItem("language", lang);
      if (typeof document !== "undefined") {
        document.documentElement.lang = lang;
        document.cookie = `kcm-lang=${lang};path=/;max-age=31536000;SameSite=Lax`;
        window.dispatchEvent(new CustomEvent("kcm-language-change", { detail: lang }));
      }
    } catch (e) {
      console.warn("Could not persist language selection:", e);
    }
  }, []);

  // Compute active dictionary with deep fallback to English
  const activeDictionary = useMemo(() => {
    const current = translations[mounted ? language : "en"] || translations.en;
    return current;
  }, [language, mounted]);

  // Dot-notation translation helper with safe English fallback
  const translate = useCallback(
    (keyPath: string, defaultText?: string): string => {
      const targetLang = mounted ? language : "en";
      const currentDict = translations[targetLang] || translations.en;
      const val = resolveKeyPath(currentDict, keyPath);
      if (val !== undefined) return val;

      // Fallback to English dictionary
      if (targetLang !== "en") {
        const fallbackVal = resolveKeyPath(translations.en, keyPath);
        if (fallbackVal !== undefined) return fallbackVal;
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
        const locale = LOCALE_MAP[mounted ? language : "en"] || "en-IN";
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
        const locale = LOCALE_MAP[mounted ? language : "en"] || "en-IN";
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
        const locale = LOCALE_MAP[mounted ? language : "en"] || "en-IN";
        return new Intl.NumberFormat(locale).format(num);
      } catch {
        return num.toLocaleString();
      }
    },
    [language, mounted]
  );

  const contextValue = useMemo(
    () => ({
      language: mounted ? language : "en",
      setLanguage: handleSetLanguage,
      t: activeDictionary,
      translate,
      formatDate,
      formatCurrency,
      formatNumber,
      isTelugu: (mounted ? language : "en") === "te",
      isHindi: (mounted ? language : "en") === "hi",
      isEnglish: (mounted ? language : "en") === "en",
    }),
    [
      language,
      mounted,
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
