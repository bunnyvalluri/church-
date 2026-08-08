"use client";

import { useLanguage } from "@/components/providers/LanguageProvider";
import { useEffect, useState, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { Globe, ChevronDown, Check, X } from "lucide-react";

interface LanguageToggleProps {
  align?: "left" | "right" | "auto";
  className?: string;
}

export default function LanguageToggle({ align = "auto", className = "" }: LanguageToggleProps) {
  const { language, setLanguage } = useLanguage();
  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [coords, setCoords] = useState<{ top: number; left: number; width: number } | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const updatePosition = useCallback(() => {
    if (!buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;
    const popoverWidth = Math.min(192, windowWidth - 32);
    const popoverHeight = 180;

    // Ideal vertical position
    let top = rect.bottom + 8;
    if (windowHeight - rect.bottom < popoverHeight && rect.top > popoverHeight) {
      top = rect.top - popoverHeight - 8;
    }
    top = Math.max(16, Math.min(top, windowHeight - popoverHeight - 16));

    // Ideal horizontal position
    let left = rect.left;
    if (align === "right" || rect.left + popoverWidth > windowWidth - 16) {
      left = rect.right - popoverWidth;
    }
    left = Math.max(16, Math.min(left, windowWidth - popoverWidth - 16));

    setCoords({ top, left, width: popoverWidth });
  }, [align]);

  const handleToggle = useCallback(() => {
    if (!isOpen) {
      updatePosition();
    }
    setIsOpen((prev) => !prev);
  }, [isOpen, updatePosition]);

  // Handle outside click & scroll/resize repositioning
  useEffect(() => {
    if (!isOpen) return;

    const handleScrollOrResize = () => {
      updatePosition();
    };

    window.addEventListener("scroll", handleScrollOrResize, true);
    window.addEventListener("resize", handleScrollOrResize);

    return () => {
      window.removeEventListener("scroll", handleScrollOrResize, true);
      window.removeEventListener("resize", handleScrollOrResize);
    };
  }, [isOpen, updatePosition]);

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
    <div className={`relative inline-block text-left shrink-0 ${className}`} ref={dropdownRef}>
      <button
        ref={buttonRef}
        type="button"
        onClick={handleToggle}
        className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 dark:bg-gray-800/90 border border-gray-200 dark:border-gray-700 hover:bg-gray-200 dark:hover:bg-gray-700/90 text-gray-900 dark:text-white rounded-full text-xs font-bold shadow-sm transition-all duration-200 active:scale-95 cursor-pointer shrink-0"
        aria-label="Select Language"
        aria-expanded={isOpen}
        suppressHydrationWarning
      >
        <Globe className="w-4 h-4 text-purple-600 dark:text-purple-300 shrink-0" />
        <span className="font-extrabold uppercase text-gray-900 dark:text-white tracking-wide" suppressHydrationWarning>{currentLang.short}</span>
        <ChevronDown className={`w-3.5 h-3.5 text-gray-500 dark:text-gray-300 transition-transform duration-200 shrink-0 ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {/* Dropdown Menu Teleported via Portal */}
      {isOpen && mounted && coords && createPortal(
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-[9990] bg-black/20 dark:bg-black/40 backdrop-blur-xs"
            onClick={() => setIsOpen(false)}
          />

          <div
            style={{
              position: "fixed",
              top: `${coords.top}px`,
              left: `${coords.left}px`,
              width: `${coords.width}px`,
            }}
            className="z-[9999] rounded-2xl bg-white/95 dark:bg-[#12132A]/95 backdrop-blur-xl border border-slate-200/80 dark:border-white/10 shadow-2xl p-1.5 space-y-1 animate-in fade-in zoom-in-95 duration-150"
          >
            <div className="flex items-center justify-between px-2.5 py-1">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-gray-500">
                Select Language
              </span>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-md text-gray-400 hover:text-gray-600 dark:hover:text-white cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
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
        </>,
        document.body
      )}
    </div>
  );
}
