"use client";

import { useLanguage } from "@/components/providers/LanguageProvider";
import { useEffect, useState, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { Globe, ChevronDown, Check, X } from "lucide-react";
import { SUPPORTED_LANGUAGES, LANGUAGE_METADATA } from "@/i18n";

interface LanguageToggleProps {
  align?: "left" | "right" | "auto";
  className?: string;
}

export default function LanguageToggle({ align = "auto", className = "" }: LanguageToggleProps) {
  const { language, setLanguage } = useLanguage();
  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [coords, setCoords] = useState<{ top: number; left: number; width: number } | null>(null);
  const [focusedIndex, setFocusedIndex] = useState<number>(0);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const optionRefs = useRef<(HTMLButtonElement | null)[]>([]);

  useEffect(() => {
    setMounted(true);
  }, []);

  const languages = SUPPORTED_LANGUAGES.map((code) => ({
    code,
    label: LANGUAGE_METADATA[code].label,
    native: LANGUAGE_METADATA[code].nativeName,
    short: LANGUAGE_METADATA[code].short,
  }));

  const currentLang = languages.find((l) => l.code === (mounted ? language : "en")) || languages[0];

  const updatePosition = useCallback(() => {
    if (!buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;
    const popoverWidth = Math.min(210, windowWidth - 32);
    const popoverHeight = 210;

    // Vertical position calculation
    let top = rect.bottom + 8;
    if (windowHeight - rect.bottom < popoverHeight && rect.top > popoverHeight) {
      top = rect.top - popoverHeight - 8;
    }
    top = Math.max(16, Math.min(top, windowHeight - popoverHeight - 16));

    // Horizontal position calculation
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
      const currentIdx = languages.findIndex((l) => l.code === language);
      setFocusedIndex(currentIdx >= 0 ? currentIdx : 0);
    }
    setIsOpen((prev) => !prev);
  }, [isOpen, language, languages, updatePosition]);

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

  // Focus the active option when opened
  useEffect(() => {
    if (isOpen && optionRefs.current[focusedIndex]) {
      optionRefs.current[focusedIndex]?.focus();
    }
  }, [isOpen, focusedIndex]);

  const handleSelect = (code: "en" | "te" | "hi") => {
    setLanguage(code);
    setIsOpen(false);
    buttonRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === "ArrowDown" || e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        handleToggle();
      }
      return;
    }

    if (e.key === "Escape") {
      e.preventDefault();
      setIsOpen(false);
      buttonRef.current?.focus();
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setFocusedIndex((prev) => (prev + 1) % languages.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setFocusedIndex((prev) => (prev - 1 + languages.length) % languages.length);
    } else if (e.key === "Tab") {
      setIsOpen(false);
    }
  };

  return (
    <div className={`relative inline-block text-left shrink-0 ${className}`} ref={dropdownRef}>
      <button
        ref={buttonRef}
        type="button"
        onClick={handleToggle}
        onKeyDown={handleKeyDown}
        className="flex items-center gap-1.5 px-3 h-9 bg-gray-100 dark:bg-gray-800/90 border border-gray-200 dark:border-gray-700 hover:bg-gray-200 dark:hover:bg-gray-700/90 text-gray-900 dark:text-white rounded-full text-xs font-bold shadow-sm transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer shrink-0 focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:outline-none"
        aria-label={`Select Language, currently ${currentLang.label}`}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        suppressHydrationWarning
      >
        <Globe className="w-4 h-4 text-purple-600 dark:text-purple-300 shrink-0" aria-hidden="true" />
        <span className="font-extrabold uppercase text-gray-900 dark:text-white tracking-wide" suppressHydrationWarning>
          {currentLang.short}
        </span>
        <ChevronDown
          className={`w-3.5 h-3.5 text-gray-500 dark:text-gray-300 transition-transform duration-200 shrink-0 ${
            isOpen ? "rotate-180" : ""
          }`}
          aria-hidden="true"
        />
      </button>

      {/* Dropdown Menu Teleported via Portal */}
      {isOpen && mounted && coords && createPortal(
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-[9990] bg-black/20 dark:bg-black/40 backdrop-blur-xs"
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />

          <div
            role="listbox"
            aria-label="Language options"
            style={{
              position: "fixed",
              top: `${coords.top}px`,
              left: `${coords.left}px`,
              width: `${coords.width}px`,
            }}
            className="z-[9999] rounded-2xl bg-white/95 dark:bg-[#12132A]/95 backdrop-blur-xl border border-slate-200/80 dark:border-white/10 shadow-2xl p-1.5 space-y-1 animate-in fade-in zoom-in-95 duration-150"
            onKeyDown={handleKeyDown}
          >
            <div className="flex items-center justify-between px-2.5 py-1">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-gray-500">
                🌐 Language / భాష / भाषा
              </span>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-md text-gray-400 hover:text-gray-600 dark:hover:text-white cursor-pointer focus:outline-none"
                aria-label="Close language selector"
              >
                <X className="w-3.5 h-3.5" aria-hidden="true" />
              </button>
            </div>
            {languages.map((lang, index) => {
              const isActive = mounted && language === lang.code;
              return (
                <button
                  key={lang.code}
                  ref={(el) => {
                    optionRefs.current[index] = el;
                  }}
                  role="option"
                  aria-selected={isActive}
                  type="button"
                  onClick={() => handleSelect(lang.code)}
                  className={`w-full flex items-center justify-between px-3 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 ${
                    isActive
                      ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md"
                      : "text-slate-700 dark:text-gray-200 hover:bg-slate-100 dark:hover:bg-white/5"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={`font-extrabold text-[11px] uppercase w-6 text-left ${
                        isActive ? "text-white" : "text-slate-400 dark:text-gray-400"
                      }`}
                    >
                      {lang.short}
                    </span>
                    <span className="font-medium">{lang.native}</span>
                    <span className="text-[10px] opacity-60">({lang.label})</span>
                  </div>
                  {isActive && <Check className="w-3.5 h-3.5 text-white shrink-0" aria-hidden="true" />}
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
