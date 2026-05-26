"use client";

import { useState, useEffect, useRef } from "react";
import { Palette, Check, Settings } from "lucide-react";
import { useColorTheme, palettes, ColorTheme } from "@/components/providers/ColorThemeProvider";
import { useLanguage } from "@/components/providers/LanguageProvider";

export default function PaletteToggle() {
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
    { code: "violet", label: "Royal Violet", desc: "Majesty & Faith", color: "from-purple-500 to-indigo-600" },
    { code: "emerald", label: "Emerald Glory", desc: "Growth & Healing", color: "from-emerald-500 to-teal-600" },
    { code: "ocean", label: "Ocean Grace", desc: "Serenity & Baptism", color: "from-blue-500 to-cyan-600" },
    { code: "crimson", label: "Crimson Salvation", desc: "Love & Redemption", color: "from-rose-500 to-red-600" },
    { code: "gold", label: "Anointed Amber", desc: "Anointing & Light", color: "from-amber-500 to-orange-600" },
  ] as const;

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Settings Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-9 h-9 flex items-center justify-center rounded-xl bg-gray-100/80 dark:bg-white/5 backdrop-blur-md border border-gray-200/60 dark:border-white/10 text-gray-700 dark:text-gray-200 hover:text-purple-600 dark:hover:text-purple-400 hover:scale-105 active:scale-95 transition-all shadow-sm group"
        title="Settings"
        type="button"
      >
        <Settings className="w-4.5 h-4.5 group-hover:rotate-45 transition-transform duration-500" />
      </button>

      {/* Glassmorphic Dropdown Panel */}
      {isOpen && (
        <div className="absolute right-0 mt-3 w-72 rounded-2xl bg-white/95 dark:bg-gray-950/95 border border-gray-200/50 dark:border-white/10 shadow-2xl backdrop-blur-xl p-4 z-50 animate-scale-in">
          {/* Header */}
          <div className="flex items-center gap-2 pb-3 mb-3 border-b border-gray-100 dark:border-white/5">
            <Palette className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            <div>
              <h4 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider">SETTINGS</h4>
              <p className="text-[10px] text-gray-500 dark:text-gray-400">Customize color scheme</p>
            </div>
          </div>

          {/* Theme Options */}
          <div className="space-y-1.5">
            {colorThemes.map((item) => {
              const isActive = theme === item.code;
              return (
                <button
                  key={item.code}
                  onClick={() => {
                    setTheme(item.code as ColorTheme);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between p-2.5 rounded-xl transition-all text-left ${
                    isActive
                      ? "bg-purple-500/10 dark:bg-purple-400/5 border border-purple-500/20 dark:border-purple-400/10"
                      : "hover:bg-gray-100/50 dark:hover:bg-white/5 border border-transparent"
                  }`}
                  type="button"
                >
                  <div className="flex items-center gap-3">
                    {/* Circle Color Preview */}
                    <div className={`w-8 h-8 rounded-xl bg-gradient-to-tr ${item.color} shadow-sm flex items-center justify-center flex-shrink-0`}>
                      <span className="text-white text-xs font-bold font-sans">✝</span>
                    </div>
                    <div>
                      <span className={`block text-xs font-bold tracking-tight ${isActive ? "text-purple-700 dark:text-purple-400" : "text-gray-700 dark:text-gray-300"}`}>
                        {item.label}
                      </span>
                      <span className="block text-[9px] text-gray-400 dark:text-gray-500 mt-0.5 leading-none">
                        {item.desc}
                      </span>
                    </div>
                  </div>

                  {/* Check Indicator */}
                  {isActive && (
                    <div className="w-5 h-5 rounded-full bg-purple-600 dark:bg-purple-500 flex items-center justify-center text-white scale-100 animate-scale-in">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
