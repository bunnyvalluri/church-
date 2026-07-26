"use client";

import { useLanguage } from "@/components/providers/LanguageProvider";
import { useEffect, useState } from "react";
import { Globe } from "lucide-react";

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

  const activeLang = languages.find(l => l.code === (mounted ? language : "en")) || languages[0];

  const cycleLanguage = () => {
    const currentIndex = languages.findIndex(l => l.code === language);
    const nextIndex = (currentIndex + 1) % languages.length;
    setLanguage(languages[nextIndex].code);
  };

  return (
    <>
      {/* Mobile 1-Tap Cycle Button (< sm) */}
      <button
        type="button"
        onClick={cycleLanguage}
        className="sm:hidden flex items-center gap-1 px-2.5 py-1.5 bg-slate-200/80 dark:bg-white/10 text-slate-800 dark:text-white rounded-xl border border-slate-300/80 dark:border-white/15 text-[10px] font-black uppercase shadow-sm active:scale-95 transition-all shrink-0"
        title={`Language: ${activeLang.label} (Tap to change)`}
      >
        <Globe className="w-3 h-3 text-indigo-600 dark:text-indigo-400" />
        <span>{activeLang.short}</span>
      </button>

      {/* Desktop 3-Pill Switcher (>= sm) */}
      <div className="hidden sm:flex items-center gap-0.5 p-1 bg-slate-200/80 dark:bg-white/10 rounded-xl border border-slate-300/80 dark:border-white/15 shadow-inner shrink-0">
        {languages.map((lang) => {
          const isActive = mounted && language === lang.code;
          return (
            <button
              key={lang.code}
              type="button"
              suppressHydrationWarning
              onClick={() => setLanguage(lang.code)}
              className={`px-2.5 py-1 text-[10px] font-extrabold uppercase rounded-lg transition-all duration-200 active:scale-95 ${
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
    </>
  );
}
