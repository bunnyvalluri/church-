"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { translations } from "@/lib/translations";

type Language = "en" | "te" | "hi";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: typeof translations.en;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>("en");
  const [mounted, setMounted] = useState(false);

  // Load saved preference
  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem("language") as Language;
    if (saved) {
      setLanguage(saved);
      if (typeof document !== "undefined") {
        document.documentElement.lang = saved;
      }
    } else {
      if (typeof document !== "undefined") {
        document.documentElement.lang = "en";
      }
    }
  }, []);

  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem("language", lang);
    if (typeof document !== "undefined") {
      document.documentElement.lang = lang;
    }
  };

  const t = translations[mounted ? language : "en"];

  return (
    <LanguageContext.Provider value={{ language: mounted ? language : "en", setLanguage: handleSetLanguage, t }}>
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
