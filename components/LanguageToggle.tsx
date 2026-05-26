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
    { code: "te", label: "తెలుగు", short: "TE" },
    { code: "hi", label: "हिंदी", short: "HI" },
  ] as const;

  if (!mounted) {
    return (
      <div className="flex items-center gap-1 p-1 bg-gray-100/80 dark:bg-white/5 backdrop-blur-md rounded-xl border border-gray-200/60 dark:border-white/10 shadow-inner w-[128px] h-[36px]" />
    );
  }

  return (
    <div className="flex items-center gap-1 p-1 bg-gray-100/80 dark:bg-white/5 backdrop-blur-md rounded-xl border border-gray-200/60 dark:border-white/10 shadow-inner">
      {languages.map((lang) => {
        const isActive = language === lang.code;
        return (
          <button
            key={lang.code}
            type="button"
            onClick={() => setLanguage(lang.code)}
            className={`px-3 py-1.5 text-[10px] font-extrabold uppercase rounded-lg transition-all duration-300 active:scale-95 ${
              isActive
                ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-500/10 scale-105"
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

