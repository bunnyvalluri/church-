"use client";

import { useLanguage } from "@/components/providers/LanguageProvider";
import { useEffect, useState, useRef } from "react";
import { Globe, ChevronDown, Check } from "lucide-react";

export default function LanguageToggle() {
  const { language, setLanguage } = useLanguage();
  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const languages = [
    { code: "en", label: "English", native: "English", short: "EN" },
    { code: "te", label: "Telugu",  native: "తెలుగు",   short: "TE" },
    { code: "hi", label: "Hindi",   native: "हिंदी",    short: "HI" },
  ] as const;

  const currentLang = languages.find((l) => l.code === (mounted ? language : "en")) || languages[0];

  const handleSelect = (code: "en" | "te" | "hi") => {
    setLanguage(code);
    setIsOpen(false);
  };

  return (
    <div className="relative inline-block text-left shrink-0" ref={dropdownRef}>
      {/* Dropdown Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-200/80 dark:bg-white/10 hover:bg-slate-300/80 dark:hover:bg-white/15 text-slate-800 dark:text-white rounded-xl border border-slate-300/80 dark:border-white/15 text-xs font-bold shadow-sm transition-all duration-200 active:scale-95 cursor-pointer"
        aria-label="Select Language"
        aria-expanded={isOpen}
      >
        <Globe className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
        <span className="font-extrabold uppercase">{currentLang.short}</span>
        <ChevronDown className={`w-3.5 h-3.5 text-slate-500 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 rounded-2xl bg-white/95 dark:bg-[#12132A]/95 backdrop-blur-xl border border-slate-200/80 dark:border-white/10 shadow-xl shadow-indigo-500/10 z-50 p-1.5 space-y-1 animate-in fade-in zoom-in-95 duration-150">
          <div className="px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-gray-500">
            Select Language
          </div>
          {languages.map((lang) => {
            const isActive = mounted && language === lang.code;
            return (
              <button
                key={lang.code}
                type="button"
                onClick={() => handleSelect(lang.code)}
                className={`w-full flex items-center justify-between px-3 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                  isActive
                    ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md"
                    : "text-slate-700 dark:text-gray-200 hover:bg-slate-100 dark:hover:bg-white/5"
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className={`font-extrabold text-[11px] uppercase w-5 ${isActive ? "text-white" : "text-slate-400 dark:text-gray-400"}`}>
                    {lang.short}
                  </span>
                  <span>{lang.native}</span>
                </div>
                {isActive && <Check className="w-3.5 h-3.5 text-white shrink-0" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
