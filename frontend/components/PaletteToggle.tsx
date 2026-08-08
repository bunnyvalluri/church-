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

  // Global Keyboard Shortcuts for PC / Laptop Users
  useEffect(() => {
    const handleGlobalShortcuts = (e: KeyboardEvent) => {
      // Ignore shortcut triggers inside input text fields or textareas
      const activeElement = document.activeElement;
      const isInput =
        activeElement &&
        (activeElement.tagName === "INPUT" ||
          activeElement.tagName === "TEXTAREA" ||
          (activeElement as HTMLElement).isContentEditable);

      // Ctrl + K or Cmd + K or Alt + P -> Toggle Preferences Modal
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsOpen((prev) => !prev);
        return;
      }

      if (e.altKey && e.key.toLowerCase() === "p") {
        e.preventDefault();
        setIsOpen((prev) => !prev);
        return;
      }

      if (isInput) return;

      // Escape -> Close modal
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
        return;
      }

      // Alt + D -> Toggle Dark / Light mode
      if (e.altKey && e.key.toLowerCase() === "d") {
        e.preventDefault();
        setMode(mode === "dark" ? "light" : "dark");
        return;
      }

      // Alt + L -> Toggle Language
      if (e.altKey && e.key.toLowerCase() === "l") {
        e.preventDefault();
        const nextLang = language === "en" ? "te" : language === "te" ? "hi" : "en";
        setLanguage(nextLang as any);
        return;
      }

      // Alt + 1-5 -> Quick Accent Color Select
      if (e.altKey && ["1", "2", "3", "4", "5"].includes(e.key)) {
        e.preventDefault();
        const index = parseInt(e.key, 10) - 1;
        if (colorThemes[index]) {
          setColorTheme(colorThemes[index].code as ColorTheme);
        }
        return;
      }
    };

    window.addEventListener("keydown", handleGlobalShortcuts);
    return () => window.removeEventListener("keydown", handleGlobalShortcuts);
  }, [isOpen, mode, language, setMode, setLanguage, setColorTheme]);

  const colorThemes = [
    { code: "violet", label: "Purple Glory", desc: "Grace & Royal Glory", keyNum: "1", gradientStyle: "linear-gradient(135deg, #8B5CF6 0%, #6D28D9 100%)" },
    { code: "emerald", label: "Emerald", desc: "Growth & Spiritual Healing", keyNum: "2", gradientStyle: "linear-gradient(135deg, #10B981 0%, #047857 100%)" },
    { code: "ocean", label: "Holy Blue", desc: "Truth, Peace & Baptism", keyNum: "3", gradientStyle: "linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)" },
    { code: "crimson", label: "Crimson", desc: "Redemption & Sacrificial Love", keyNum: "4", gradientStyle: "linear-gradient(135deg, #DC2626 0%, #991B1B 100%)" },
    { code: "gold", label: "Royal Gold", desc: "Kingship & Divine Anointing", keyNum: "5", gradientStyle: "linear-gradient(135deg, #D4AF37 0%, #B8860B 100%)" },
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
        className="w-9 h-9 flex items-center justify-center rounded-xl bg-gray-100 dark:bg-gray-800/90 backdrop-blur-md border border-gray-200 dark:border-gray-700 text-purple-600 dark:text-purple-300 hover:bg-gray-200 dark:hover:bg-gray-700/90 hover:scale-105 active:scale-95 transition-all shadow-sm group cursor-pointer relative"
        title="Preferences & Theme Settings (Ctrl+K)"
        type="button"
        aria-label="Open preferences modal"
      >
        <Settings className="w-4.5 h-4.5 group-hover:rotate-45 transition-transform duration-500 text-purple-600 dark:text-purple-300" />
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
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-black text-slate-900 dark:text-white tracking-tight">
                      Portal Preferences
                    </h3>
                    <kbd className="hidden sm:inline-block px-1.5 py-0.5 rounded bg-slate-100 dark:bg-white/10 border border-slate-200 dark:border-white/10 text-[10px] font-mono text-slate-500 dark:text-gray-400 font-bold">
                      Ctrl+K
                    </kbd>
                  </div>
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
                <div className="flex items-center justify-between mb-2">
                  <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-gray-400 flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5 text-indigo-500" /> Language
                  </label>
                  <kbd className="hidden sm:inline-block text-[9px] font-mono px-1.5 py-0.5 rounded bg-slate-100 dark:bg-white/10 text-slate-400 dark:text-gray-500">
                    Alt+L
                  </kbd>
                </div>
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
                <div className="flex items-center justify-between mb-2">
                  <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-gray-400 flex items-center gap-1.5">
                    <Sun className="w-3.5 h-3.5 text-amber-500" /> Mode / Appearance
                  </label>
                  <kbd className="hidden sm:inline-block text-[9px] font-mono px-1.5 py-0.5 rounded bg-slate-100 dark:bg-white/10 text-slate-400 dark:text-gray-500">
                    Alt+D
                  </kbd>
                </div>
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
              <div className="flex items-center justify-between mb-2.5">
                <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-gray-400 flex items-center gap-1.5">
                  <Palette className="w-3.5 h-3.5 text-purple-500" /> Color Accent Theme
                </label>
                <span className="hidden sm:inline-block text-[9px] font-mono text-slate-400 dark:text-gray-500">
                  Alt + 1-5
                </span>
              </div>
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
                          className="w-8 h-8 rounded-xl shadow-sm flex items-center justify-center flex-shrink-0 text-white font-mono text-xs font-bold"
                          style={{ background: item.gradientStyle }}
                        >
                          ✝
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className={`block text-xs font-bold ${isActive ? "text-purple-600 dark:text-purple-400" : "text-slate-800 dark:text-gray-200"}`}>
                              {item.label}
                            </span>
                            <kbd className="hidden sm:inline-block text-[9px] font-mono px-1 rounded bg-slate-200/60 dark:bg-white/10 text-slate-500 dark:text-gray-400">
                              Alt+{item.keyNum}
                            </kbd>
                          </div>
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

            {/* Laptop / PC Keyboard Shortcuts Footer Legend */}
            <div className="mt-4 p-3 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200/60 dark:border-white/10 text-[11px] text-slate-600 dark:text-gray-400 space-y-1.5">
              <span className="font-extrabold text-[10px] uppercase tracking-wider text-slate-400 dark:text-gray-400 block mb-1">
                ⌨ Laptop / PC Keyboard Shortcuts
              </span>
              <div className="grid grid-cols-2 gap-1 text-[10px]">
                <div><kbd className="font-mono bg-slate-200 dark:bg-white/10 px-1 py-0.5 rounded">Ctrl+K</kbd> Open/Close</div>
                <div><kbd className="font-mono bg-slate-200 dark:bg-white/10 px-1 py-0.5 rounded">Alt+D</kbd> Light/Dark</div>
                <div><kbd className="font-mono bg-slate-200 dark:bg-white/10 px-1 py-0.5 rounded">Alt+L</kbd> Toggle Language</div>
                <div><kbd className="font-mono bg-slate-200 dark:bg-white/10 px-1 py-0.5 rounded">Alt+1..5</kbd> Switch Color</div>
              </div>
            </div>

            {/* Done Button */}
            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-white/10">
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
