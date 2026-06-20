"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useTheme } from "next-themes";

export type ColorTheme = "violet" | "emerald" | "ocean" | "crimson" | "gold" | "rose" | "sky" | "olive" | "earth" | "platinum";

export interface ColorPalette {
  name: string;
  primary: string;       // HSL string for light mode (e.g. "262 83% 58%")
  primaryDark: string;   // HSL string for dark mode
  gradientStart: string; // HSL string for gradient start
  gradientEnd: string;   // HSL string for gradient end
  accent: string;        // HSL string for light mode accent tint
  accentDark: string;    // HSL string for dark mode accent tint
  color: string;         // Tailwind base color class (e.g. "bg-purple-600")
}

export const palettes: Record<ColorTheme, ColorPalette> = {
  violet: {
    name: "Purple Glory",
    primary: "258 94% 66%",
    primaryDark: "258 95% 75%",
    gradientStart: "258 94% 66%",
    gradientEnd: "280 90% 65%",
    accent: "258 94% 96%",
    accentDark: "258 40% 16%",
    color: "bg-[#8B5CF6]"
  },
  emerald: {
    name: "Emerald",
    primary: "162 76% 46%",
    primaryDark: "162 80% 55%",
    gradientStart: "162 76% 46%",
    gradientEnd: "175 80% 32%",
    accent: "162 76% 96%",
    accentDark: "162 40% 10%",
    color: "bg-[#10B981]"
  },
  ocean: {
    name: "Holy Blue",
    primary: "217 91% 60%",
    primaryDark: "217 95% 70%",
    gradientStart: "217 91% 60%",
    gradientEnd: "200 90% 48%",
    accent: "217 91% 96%",
    accentDark: "217 40% 12%",
    color: "bg-[#3B82F6]"
  },
  crimson: {
    name: "Crimson",
    primary: "0 72% 51%",
    primaryDark: "0 80% 60%",
    gradientStart: "0 72% 51%",
    gradientEnd: "350 78% 46%",
    accent: "0 72% 96%",
    accentDark: "0 40% 12%",
    color: "bg-[#DC2626]"
  },
  gold: {
    name: "Royal Gold",
    primary: "46 65% 52%",
    primaryDark: "46 75% 62%",
    gradientStart: "46 65% 52%",
    gradientEnd: "36 72% 44%",
    accent: "46 65% 95%",
    accentDark: "46 40% 12%",
    color: "bg-[#D4AF37]"
  },
  rose: {
    name: "Rose Covenant",
    primary: "340 55% 58%",
    primaryDark: "340 65% 66%",
    gradientStart: "340 55% 58%",
    gradientEnd: "355 60% 64%",
    accent: "340 55% 96%",
    accentDark: "340 30% 15%",
    color: "bg-[#cc5c7d]"
  },
  sky: {
    name: "Heavenly Sky",
    primary: "215 85% 46%",
    primaryDark: "215 90% 58%",
    gradientStart: "215 85% 46%",
    gradientEnd: "240 75% 54%",
    accent: "215 85% 96%",
    accentDark: "215 45% 12%",
    color: "bg-[#1349c5]"
  },
  olive: {
    name: "Anointed Olive",
    primary: "76 48% 36%",
    primaryDark: "76 52% 45%",
    gradientStart: "76 48% 36%",
    gradientEnd: "120 40% 32%",
    accent: "76 48% 95%",
    accentDark: "76 30% 10%",
    color: "bg-[#608020]"
  },
  earth: {
    name: "Sacred Earth",
    primary: "18 68% 44%",
    primaryDark: "18 75% 54%",
    gradientStart: "18 68% 44%",
    gradientEnd: "30 75% 42%",
    accent: "18 68% 95%",
    accentDark: "18 40% 12%",
    color: "bg-[#ba4c18]"
  },
  platinum: {
    name: "Divine Platinum",
    primary: "215 15% 45%",
    primaryDark: "215 20% 65%",
    gradientStart: "215 15% 45%",
    gradientEnd: "220 20% 55%",
    accent: "215 15% 95%",
    accentDark: "215 15% 20%",
    color: "bg-[#6b7c8f]"
  }
};

interface ColorThemeContextType {
  theme: ColorTheme;
  setTheme: (theme: ColorTheme) => void;
  currentPalette: ColorPalette;
}

const ColorThemeContext = createContext<ColorThemeContextType | undefined>(undefined);

export function ColorThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<ColorTheme>("violet");
  const { resolvedTheme } = useTheme();

  // Load initial theme from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("kcm-color-theme") as ColorTheme;
    if (saved && palettes[saved]) {
      setThemeState(saved);
    }
  }, []);

  // Whenever theme or dark/light mode changes, apply the CSS variables to the document element
  useEffect(() => {
    const root = document.documentElement;
    const p = palettes[theme];
    const isDark = resolvedTheme === "dark";

    const primaryColor = isDark ? p.primaryDark : p.primary;
    const accentColor = isDark ? p.accentDark : p.accent;

    root.style.setProperty("--primary", primaryColor);
    root.style.setProperty("--ring", primaryColor);
    root.style.setProperty("--accent", accentColor);
    
    // Gradient stops
    root.style.setProperty("--primary-gradient-start", p.gradientStart);
    root.style.setProperty("--primary-gradient-end", p.gradientEnd);
    
    // Persist
    localStorage.setItem("kcm-color-theme", theme);
  }, [theme, resolvedTheme]);

  const setTheme = (t: ColorTheme) => {
    if (palettes[t]) {
      setThemeState(t);
    }
  };

  return (
    <ColorThemeContext.Provider value={{ theme, setTheme, currentPalette: palettes[theme] }}>
      {children}
    </ColorThemeContext.Provider>
  );
}

export function useColorTheme() {
  const context = useContext(ColorThemeContext);
  if (!context) {
    throw new Error("useColorTheme must be used within a ColorThemeProvider");
  }
  return context;
}
