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
    <div className="flex items-center gap-0.5 p-1 bg-slate-200 dark:bg-white/10 rounded-xl border border-slate-300 dark:border-white/15 shadow-inner">
      {languages.map((lang) => {
        const isActive = mounted && language === lang.code;
        return (
          <button
            key={lang.code}
            type="button"
            suppressHydrationWarning
            onClick={() => setLanguage(lang.code)}
            className={`px-3 py-1.5 text-[10px] font-extrabold uppercase rounded-lg transition-all duration-200 active:scale-95 ${
              isActive
                ? "bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-md scale-105"
                : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-300/70 dark:hover:bg-white/10"
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
