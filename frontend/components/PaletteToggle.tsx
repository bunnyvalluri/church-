"use client";

import { useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { Palette, Check, Settings, X, Globe, Sun, Moon } from "lucide-react";
import { useColorTheme, ColorTheme } from "@/components/providers/ColorThemeProvider";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { useTheme } from "next-themes";

interface PaletteToggleProps {
  showPreferences?: boolean;
}

export default function PaletteToggle({ showPreferences = false }: PaletteToggleProps) {
  const { theme: colorTheme, setTheme: setColorTheme } = useColorTheme();
  const { language, setLanguage } = useLanguage();
  const { theme: mode, setTheme: setMode } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Close modal on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  const colorThemes = [
    { code: "violet", label: "Purple Glory", desc: "Grace & Royal Glory", gradientStyle: "linear-gradient(135deg, #8B5CF6 0%, #6D28D9 100%)" },
    { code: "emerald", label: "Emerald", desc: "Growth & Spiritual Healing", gradientStyle: "linear-gradient(135deg, #10B981 0%, #047857 100%)" },
    { code: "ocean", label: "Holy Blue", desc: "Truth, Peace & Baptism", gradientStyle: "linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)" },
    { code: "crimson", label: "Crimson", desc: "Redemption & Sacrificial Love", gradientStyle: "linear-gradient(135deg, #DC2626 0%, #991B1B 100%)" },
    { code: "gold", label: "Royal Gold", desc: "Kingship & Divine Anointing", gradientStyle: "linear-gradient(135deg, #D4AF37 0%, #B8860B 100%)" },
  ] as const;

  const languages = [
    { code: "en", label: "English", short: "EN" },
    { code: "te", label: "తెలుగు", short: "TE" },
    { code: "hi", label: "हिंदी", short: "HI" },
  ] as const;

  return (
    <div className="relative inline-block text-left shrink-0">
      {/* Settings Toggle Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="w-9 h-9 flex items-center justify-center rounded-xl bg-gray-100/80 dark:bg-white/10 backdrop-blur-md border border-gray-200/60 dark:border-white/20 text-gray-700 dark:text-white hover:text-[hsl(var(--primary))] hover:scale-105 active:scale-95 transition-all shadow-sm group cursor-pointer"
        title="Preferences & Theme Settings"
        type="button"
        aria-label="Open preferences modal"
      >
        <Settings className="w-4.5 h-4.5 group-hover:rotate-45 transition-transform duration-500" />
      </button>

      {/* Senior UI/UX Centered Preferences Modal */}
      {isOpen && mounted && createPortal(
        <>
          {/* Glassmorphic Backdrop */}
          <div
            className="fixed inset-0 z-[9990] bg-slate-950/60 backdrop-blur-md animate-in fade-in duration-200"
            onClick={() => setIsOpen(false)}
          />

          {/* Modal Container */}
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[9999] w-[92vw] max-w-md rounded-3xl bg-white dark:bg-[#12132A] border border-slate-200 dark:border-white/10 shadow-2xl shadow-purple-500/10 p-5 sm:p-6 backdrop-blur-2xl animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto custom-scrollbar">
            
            {/* Header */}
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100 dark:border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-md shadow-purple-500/20 text-white">
                  <Settings className="w-5 h-5 animate-spin-slow" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900 dark:text-white tracking-tight">
                    Portal Preferences
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-gray-400">
                    Customize your experience & color theme
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/20 text-slate-500 dark:text-gray-300 flex items-center justify-center transition-all cursor-pointer"
                aria-label="Close preferences"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Controls Section */}
            <div className="space-y-4 mb-5">
              {/* Language Selector */}
              <div>
                <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-gray-400 mb-2 flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-indigo-500" /> Language
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {languages.map((lang) => {
                    const isActive = language === lang.code;
                    return (
                      <button
                        key={lang.code}
                        type="button"
                        onClick={() => setLanguage(lang.code as any)}
                        className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                          isActive
                            ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white border-transparent shadow-md"
                            : "bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-700 dark:text-gray-200 hover:bg-slate-100 dark:hover:bg-white/10"
                        }`}
                      >
                        <span className="font-extrabold text-[10px] opacity-75">{lang.short}</span>
                        <span>{lang.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Mode Toggle */}
              <div>
                <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-gray-400 mb-2 flex items-center gap-1.5">
                  <Sun className="w-3.5 h-3.5 text-amber-500" /> Mode / Appearance
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setMode("light")}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
                      mode === "light"
                        ? "bg-slate-900 text-white border-transparent shadow-md"
                        : "bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-700 dark:text-gray-200 hover:bg-slate-100 dark:hover:bg-white/10"
                    }`}
                  >
                    <Sun className="w-3.5 h-3.5 text-amber-500" />
                    <span>Light Mode</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setMode("dark")}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
                      mode === "dark"
                        ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white border-transparent shadow-md"
                        : "bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-700 dark:text-gray-200 hover:bg-slate-100 dark:hover:bg-white/10"
                    }`}
                  >
                    <Moon className="w-3.5 h-3.5 text-indigo-300" />
                    <span>Dark Mode</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Color Theme Palette */}
            <div>
              <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-gray-400 mb-2.5 flex items-center gap-1.5">
                <Palette className="w-3.5 h-3.5 text-purple-500" /> Color Accent Theme
              </label>
              <div className="space-y-2">
                {colorThemes.map((item) => {
                  const isActive = colorTheme === item.code;
                  return (
                    <button
                      key={item.code}
                      onClick={() => {
                        setColorTheme(item.code as ColorTheme);
                      }}
                      className={`w-full flex items-center justify-between p-3 rounded-2xl transition-all text-left cursor-pointer border ${
                        isActive
                          ? "bg-purple-500/10 border-purple-500/40 shadow-sm"
                          : "bg-slate-50/70 dark:bg-white/5 border-slate-200/80 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/10"
                      }`}
                      type="button"
                    >
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-8 h-8 rounded-xl shadow-sm flex items-center justify-center flex-shrink-0 text-white"
                          style={{ background: item.gradientStyle }}
                        >
                          <span className="text-xs font-bold">✝</span>
                        </div>
                        <div>
                          <span className={`block text-xs font-bold ${isActive ? "text-purple-600 dark:text-purple-400" : "text-slate-800 dark:text-gray-200"}`}>
                            {item.label}
                          </span>
                          <span className="block text-[10px] text-slate-500 dark:text-gray-400">
                            {item.desc}
                          </span>
                        </div>
                      </div>

                      {isActive && (
                        <div className="w-5 h-5 rounded-full bg-purple-600 text-white flex items-center justify-center shadow-md">
                          <Check className="w-3 h-3 stroke-[3]" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Done Button */}
            <div className="mt-5 pt-4 border-t border-slate-100 dark:border-white/10">
              <button
                onClick={() => setIsOpen(false)}
                className="w-full py-3 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white rounded-xl font-bold text-xs shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 active:scale-[0.99] transition-all cursor-pointer"
              >
                Save & Close
              </button>
            </div>

          </div>
        </>,
        document.body
      )}
    </div>
  );
}
