"use client";

import { useLanguage } from "@/components/providers/LanguageProvider";
import { useEffect, useState } from "react";

export default function LanguageToggle() {
  const { language, setLanguage } = useLanguage();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const languages = [
    { code: "en", label: "English", short: "EN" },
    { code: "te", label: "తెలుగు",   short: "TE" },
    { code: "hi", label: "हिंदी",    short: "HI" },
  ] as const;

  // Always render the full structure — suppressHydrationWarning on active-state element
  // Never return a different JSX shape before/after mount (causes hydration error)
  return (
    <div className="flex items-center gap-1 p-1 bg-gray-100/80 dark:bg-white/5 backdrop-blur-md rounded-xl border border-gray-200/60 dark:border-white/10 shadow-inner">
      {languages.map((lang) => {
        const isActive = mounted && language === lang.code;
        return (
          <button
            key={lang.code}
            type="button"
            suppressHydrationWarning
            onClick={() => setLanguage(lang.code)}
            className={`px-3 py-1.5 text-[10px] font-extrabold uppercase rounded-lg transition-all duration-300 active:scale-95 ${
              isActive
                ? "bg-gradient-to-r from-[hsl(var(--primary-gradient-start))] to-[hsl(var(--primary-gradient-end))] text-white shadow-md scale-105"
                : "text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-gray-200/50 dark:hover:bg-white/5"
            }`}
            title={lang.label}
          >
            {lang.short}
          </button>
        );
      })}
    </div>
  );
}
