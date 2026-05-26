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
    { code: "violet", label: "Imperial Amethyst", desc: "Majesty & Faith", gradientStyle: "linear-gradient(135deg, #7a3db8 0%, #a044b8 100%)" },
    { code: "emerald", label: "Sacred Emerald", desc: "Growth & Healing", gradientStyle: "linear-gradient(135deg, #0a6646 0%, #108552 100%)" },
    { code: "ocean", label: "Graceful Sapphire", desc: "Serenity & Baptism", gradientStyle: "linear-gradient(135deg, #1a4db8 0%, #208fb8 100%)" },
    { code: "crimson", label: "Divine Ruby", desc: "Love & Redemption", gradientStyle: "linear-gradient(135deg, #b81a3d 0%, #b81a7a 100%)" },
    { code: "gold", label: "Crown Amber", desc: "Anointing & Light", gradientStyle: "linear-gradient(135deg, #b8701a 0%, #d88924 100%)" },
    { code: "rose", label: "Rose Covenant", desc: "Purity & Peace", gradientStyle: "linear-gradient(135deg, #cc5c7d 0%, #e27d9c 100%)" },
    { code: "sky", label: "Heavenly Sky", desc: "Grace & Devotion", gradientStyle: "linear-gradient(135deg, #1349c5 0%, #3a75e0 100%)" },
    { code: "olive", label: "Anointed Olive", desc: "Serenity & Covenant", gradientStyle: "linear-gradient(135deg, #608020 0%, #2b5c1b 100%)" },
    { code: "earth", label: "Sacred Earth", desc: "Warmth & Provision", gradientStyle: "linear-gradient(135deg, #ba4c18 0%, #d87130 100%)" },
    { code: "platinum", label: "Divine Platinum", desc: "Refinement & Light", gradientStyle: "linear-gradient(135deg, #6b7c8f 0%, #8c9eae 100%)" },
  ] as const;

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Settings Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-9 h-9 flex items-center justify-center rounded-xl bg-gray-100/80 dark:bg-white/5 backdrop-blur-md border border-gray-200/60 dark:border-white/10 text-gray-700 dark:text-gray-200 hover:text-[hsl(var(--primary))] hover:scale-105 active:scale-95 transition-all shadow-sm group"
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
            <Palette className="w-4 h-4 text-[hsl(var(--primary))]" />
            <div>
              <h4 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider">SETTINGS</h4>
              <p className="text-[10px] text-gray-500 dark:text-gray-400">Customize color scheme</p>
            </div>
          </div>

          {/* Theme Options */}
          <div className="space-y-1.5 max-h-[300px] overflow-y-auto pr-1 scrollbar-thin">
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
                      ? "bg-[hsl(var(--primary))/0.08] border border-[hsl(var(--primary))/0.2]"
                      : "hover:bg-gray-100/50 dark:hover:bg-white/5 border border-transparent"
                  }`}
                  type="button"
                >
                  <div className="flex items-center gap-3">
                    {/* Circle Color Preview */}
                    <div 
                      className="w-8 h-8 rounded-xl shadow-sm flex items-center justify-center flex-shrink-0"
                      style={{ background: item.gradientStyle }}
                    >
                      <span className="text-white text-xs font-bold font-sans">✝</span>
                    </div>
                    <div>
                      <span className={`block text-xs font-bold tracking-tight ${isActive ? "text-[hsl(var(--primary))]" : "text-gray-700 dark:text-gray-300"}`}>
                        {item.label}
                      </span>
                      <span className="block text-[9px] text-gray-400 dark:text-gray-500 mt-0.5 leading-none">
                        {item.desc}
                      </span>
                    </div>
                  </div>

                  {/* Check Indicator */}
                  {isActive && (
                    <div className="w-5 h-5 rounded-full bg-[hsl(var(--primary))] flex items-center justify-center text-white scale-100 animate-scale-in">
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
