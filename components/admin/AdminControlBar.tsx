"use client";

import { useLanguage } from "@/components/providers/LanguageProvider";
import { useColorTheme, palettes, ColorTheme } from "@/components/providers/ColorThemeProvider";
import { useEffect, useState, useRef } from "react";
import { Settings, Check } from "lucide-react";

export default function AdminControlBar({ onNavigateSettings }: { onNavigateSettings?: () => void }) {
  const [mounted, setMounted] = useState(false);
  const { language, setLanguage } = useLanguage();
  const { theme: activeColorTheme, setTheme: setActiveColorTheme } = useColorTheme();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Close dropdown menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  if (!mounted) {
    // Return skeleton loader to prevent hydration flickering
    return (
      <div className="flex items-center gap-2 p-1 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-full w-[240px] h-10 opacity-50" />
    );
  }

  const languages = [
    { code: "en", label: "English", short: "EN" },
    { code: "te", label: "తెలుగు",   short: "TE" },
    { code: "hi", label: "हिंदी",    short: "HI" },
  ] as const;

  const isTe = language === "te";
  const isHi = language === "hi";
  const accentPaletteLabel = isTe ? "యాక్సెంట్ కలర్ పాలెట్" : isHi ? "एक्सेन्ट कलर पैलेट" : "Accent Color Palette";
  const systemSettingsBtn = isTe ? "సిస్టమ్ సెట్టింగ్‌ల పేజీ" : isHi ? "सिस्टम सेटिंग्स पेज" : "System Settings Page";

  const getPaletteNameTranslation = (name: string) => {
    switch (name) {
      case "Violet Dream": return isTe ? "వైలెట్ డ్రీమ్" : isHi ? "वायलेट ड्रीम" : "Violet Dream";
      case "Emerald Garden": return isTe ? "ఎమరాల్డ్ గార్డెన్" : isHi ? "एमराल्ड गार्डन" : "Emerald Garden";
      case "Ocean Breeze": return isTe ? "ఓషన్ బ్రీజ్" : isHi ? "ओशन ब्रीज" : "Ocean Breeze";
      case "Crimson Fire": return isTe ? "క్రిమ్సన్ ఫైర్" : isHi ? "क्रिमसन फायर" : "Crimson Fire";
      case "Gold Dust": return isTe ? "గోల్డ్ డస్ట్" : isHi ? "गोल्ड डस्ट" : "Gold Dust";
      case "Rose Blossom": return isTe ? "రోజ్ బ్లోసమ్" : isHi ? "रोज ब्लॉसम" : "Rose Blossom";
      case "Sky High": return isTe ? "స్కై హై" : isHi ? "स्काई हाई" : "Sky High";
      case "Olive Grove": return isTe ? "ఆలివ్ గ్రోవ్" : isHi ? "ऑलिव ग्रोव" : "Olive Grove";
      case "Earth Clay": return isTe ? "ఎర్త్ క్లే" : isHi ? "अर्थ क्ले" : "Earth Clay";
      case "Platinum Luxe": return isTe ? "ప్లాటినం లక్స్" : isHi ? "प्लेटिनम लक्स" : "Platinum Luxe";
      default: return name;
    }
  };

  return (
    <div className="flex items-center gap-2 p-1 bg-gray-150/40 dark:bg-white/5 border border-gray-200/50 dark:border-white/10 backdrop-blur-md rounded-full shadow-sm relative select-none">
      
      {/* 1. Language Toggle */}
      <div className="flex items-center gap-0.5 bg-gray-200/60 dark:bg-black/25 rounded-full p-0.5 border border-gray-200/20 dark:border-white/[0.02]">
        {languages.map((lang) => {
          const isActive = language === lang.code;
          return (
            <button
              key={lang.code}
              type="button"
              onClick={() => setLanguage(lang.code)}
              className={`w-9 h-7 text-[10px] font-black uppercase rounded-full transition-all duration-300 active:scale-90 flex items-center justify-center ${
                isActive
                  ? "bg-gradient-to-r from-gradient-start to-gradient-end text-white shadow-sm"
                  : "text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
              }`}
              title={lang.label}
            >
              {lang.short}
            </button>
          );
        })}
      </div>

      {/* 3. Settings Gear & Theme Customizer Dropdown */}
      <div className="relative" ref={menuRef}>
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className={`w-8 h-8 flex items-center justify-center rounded-full transition-all duration-200 border border-transparent ${
            isMenuOpen 
              ? "bg-gradient-to-r from-gradient-start to-gradient-end text-white shadow-md rotate-45"
              : "bg-gray-200/60 dark:bg-black/25 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-gray-300/40 dark:hover:bg-white/5"
          }`}
          aria-label="Open customizer panel"
        >
          <Settings className="w-4 h-4" />
        </button>

        {isMenuOpen && (
          <div className="absolute right-0 mt-3.5 w-64 bg-[#0E0F1E]/95 dark:bg-[#0c0d1b]/98 backdrop-blur-xl border border-white/[0.08] shadow-2xl rounded-2xl p-4.5 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
            <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2.5">{accentPaletteLabel}</h4>
            <div className="grid grid-cols-5 gap-2.5 mb-4">
              {(Object.keys(palettes) as ColorTheme[]).map((pKey) => {
                const isSelected = activeColorTheme === pKey;
                // Color dots matching palettes configuration
                const hexColor = 
                  pKey === "violet" ? "#8B5CF6" :
                  pKey === "emerald" ? "#10B981" :
                  pKey === "ocean" ? "#3B82F6" :
                  pKey === "crimson" ? "#DC2626" :
                  pKey === "gold" ? "#D4AF37" :
                  pKey === "rose" ? "#CC5C7D" :
                  pKey === "sky" ? "#1349C5" :
                  pKey === "olive" ? "#608020" :
                  pKey === "earth" ? "#BA4C18" :
                  "#6B7C8F"; // platinum
                
                return (
                  <button
                    key={pKey}
                    type="button"
                    onClick={() => setActiveColorTheme(pKey)}
                    className={`w-8 h-8 rounded-full flex items-center justify-center transition-all relative border-2 ${
                      isSelected ? "border-white scale-110 shadow-lg" : "border-transparent hover:scale-105 active:scale-95"
                    }`}
                    style={{ backgroundColor: hexColor }}
                    title={getPaletteNameTranslation(palettes[pKey].name)}
                  >
                    {isSelected && <Check className="w-3.5 h-3.5 text-white stroke-[3px]" />}
                  </button>
                );
              })}
            </div>
            
            {onNavigateSettings && (
              <>
                <hr className="border-white/[0.05] my-3" />
                <button
                  type="button"
                  onClick={() => {
                    onNavigateSettings();
                    setIsMenuOpen(false);
                  }}
                  className="w-full py-2.5 bg-white/5 hover:bg-white/10 text-center rounded-xl text-[10px] font-bold uppercase tracking-wider text-indigo-300 transition-colors"
                >
                  {systemSettingsBtn}
                </button>
              </>
            )}
          </div>
        )}
      </div>

    </div>
  );
}
