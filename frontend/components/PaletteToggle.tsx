"use client";

import { useState, useEffect, useRef } from "react";
import { Palette, Check, Settings } from "lucide-react";
import { useColorTheme, ColorTheme } from "@/components/providers/ColorThemeProvider";
import LanguageToggle from "@/components/LanguageToggle";
import ThemeToggle from "@/components/ThemeToggle";
import Link from "next/link";

interface PaletteToggleProps {
  showPreferences?: boolean;
}

export default function PaletteToggle({ showPreferences = false }: PaletteToggleProps) {
  const { theme, setTheme } = useColorTheme();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const colorThemes = [
    { code: "violet", label: "Purple Glory", desc: "Grace & Glory", gradientStyle: "linear-gradient(135deg, #8B5CF6 0%, #6D28D9 100%)" },
    { code: "emerald", label: "Emerald", desc: "Growth & Healing", gradientStyle: "linear-gradient(135deg, #10B981 0%, #047857 100%)" },
    { code: "ocean", label: "Holy Blue", desc: "Truth & Baptism", gradientStyle: "linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)" },
    { code: "crimson", label: "Crimson", desc: "Redemption & Love", gradientStyle: "linear-gradient(135deg, #DC2626 0%, #991B1B 100%)" },
    { code: "gold", label: "Royal Gold", desc: "Kingship & Anointing", gradientStyle: "linear-gradient(135deg, #D4AF37 0%, #B8860B 100%)" },
  ] as const;

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Settings Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-9 h-9 flex items-center justify-center rounded-xl bg-gray-100/80 dark:bg-violet-500/10 backdrop-blur-md border border-gray-200/60 dark:border-violet-400/20 text-gray-700 dark:text-violet-200 hover:text-[hsl(var(--primary))] hover:scale-105 active:scale-95 transition-all shadow-sm group"
        title="Settings"
        type="button"
      >
        <Settings className="w-4.5 h-4.5 group-hover:rotate-45 transition-transform duration-500" />
      </button>

      {/* Glassmorphic Dropdown Panel */}
      {isOpen && (
        <div className="absolute right-0 mt-3 w-72 rounded-2xl bg-white/95 dark:bg-slate-950/95 border border-gray-200/50 dark:border-violet-500/20 shadow-2xl dark:shadow-[0_8px_40px_rgba(109,40,217,0.2)] backdrop-blur-xl p-4 z-50 animate-scale-in">
          {/* Header */}
          <div className="flex items-center gap-2 pb-3 mb-3 border-b border-gray-100 dark:border-white/5">
            <Settings className="w-4 h-4 text-[hsl(var(--primary))] animate-spin-slow" />
            <div>
              <h4 className="text-xs font-black text-gray-950 dark:text-white uppercase tracking-wider">Preferences</h4>
              <p className="text-[10px] text-gray-550 dark:text-gray-400">Customize your experience</p>
            </div>
          </div>

          {/* Quick Preferences (Language & Appearance) */}
          {showPreferences && (
            <div className="space-y-3 pb-3.5 mb-3.5 border-b border-gray-100 dark:border-white/5">
              {/* Language */}
              <div className="space-y-1">
                <span className="block text-[10px] font-extrabold uppercase tracking-wider text-gray-400 dark:text-gray-555">
                  Language
                </span>
                <div className="flex justify-start">
                  <LanguageToggle />
                </div>
              </div>

              {/* Theme */}
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-gray-400 dark:text-gray-555">
                  Appearance
                </span>
                <ThemeToggle />
              </div>

              {/* Member Login (visible below xl breakpoint in preferences menu) */}
              <div className="xl:hidden pt-1.5">
                <Link
                  href="/login"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center justify-center w-full py-2.5 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-xl font-bold text-xs shadow-md hover:shadow-purple-500/20 active:scale-95 transition-all"
                >
                  Member Login
                </Link>
              </div>
            </div>
          )}

          {/* Color Themes */}
          <div className="space-y-2">
            <span className="block text-[10px] font-extrabold uppercase tracking-wider text-gray-400 dark:text-gray-555">
              Color Theme
            </span>
            <div className="space-y-1.5 max-h-[220px] overflow-y-auto pr-1 scrollbar-thin">
              {colorThemes.map((item) => {
                const isActive = theme === item.code;
                return (
                  <button
                    key={item.code}
                    onClick={() => {
                      setTheme(item.code as ColorTheme);
                      setIsOpen(false);
                    }}
                    className={`w-full flex items-center justify-between p-2 rounded-xl transition-all text-left ${
                      isActive
                        ? "bg-[hsl(var(--primary))/0.08] border border-[hsl(var(--primary))/0.2]"
                        : "hover:bg-gray-100/50 dark:hover:bg-white/5 border border-transparent"
                    }`}
                    type="button"
                  >
                    <div className="flex items-center gap-2.5">
                      {/* Circle Color Preview */}
                      <div 
                        className="w-7 h-7 rounded-lg shadow-sm flex items-center justify-center flex-shrink-0"
                        style={{ background: item.gradientStyle }}
                      >
                        <span className="text-white text-[10px] font-sans">✝</span>
                      </div>
                      <div>
                        <span className={`block text-xs font-bold tracking-tight ${isActive ? "text-[hsl(var(--primary))]" : "text-gray-700 dark:text-gray-300"}`}>
                          {item.label}
                        </span>
                        <span className="block text-[9px] text-gray-400 dark:text-gray-550 mt-0.5 leading-none">
                          {item.desc}
                        </span>
                      </div>
                    </div>

                    {/* Check Indicator */}
                    {isActive && (
                      <div className="w-4 h-4 rounded-full bg-[hsl(var(--primary))] flex items-center justify-center text-white scale-100 animate-scale-in">
                        <Check className="w-2.5 h-2.5 stroke-[3]" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
