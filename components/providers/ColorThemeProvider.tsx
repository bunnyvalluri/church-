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
    name: "Imperial Amethyst",
    primary: "268 75% 52%",
    primaryDark: "268 85% 62%",
    gradientStart: "268 75% 52%",
    gradientEnd: "290 80% 55%",
    accent: "268 75% 96%",
    accentDark: "268 35% 14%",
    color: "bg-[#7a3db8]"
  },
  emerald: {
    name: "Sacred Emerald",
    primary: "160 84% 28%",
    primaryDark: "160 75% 38%",
    gradientStart: "160 84% 28%",
    gradientEnd: "175 80% 32%",
    accent: "160 84% 96%",
    accentDark: "160 40% 10%",
    color: "bg-[#0a6646]"
  },
  ocean: {
    name: "Graceful Sapphire",
    primary: "225 80% 45%",
    primaryDark: "225 85% 58%",
    gradientStart: "225 80% 45%",
    gradientEnd: "200 90% 48%",
    accent: "225 80% 96%",
    accentDark: "225 40% 12%",
    color: "bg-[#1a4db8]"
  },
  crimson: {
    name: "Divine Ruby",
    primary: "350 78% 46%",
    primaryDark: "350 82% 56%",
    gradientStart: "350 78% 46%",
    gradientEnd: "328 75% 42%",
    accent: "350 78% 96%",
    accentDark: "350 40% 12%",
    color: "bg-[#b81a3d]"
  },
  gold: {
    name: "Crown Amber",
    primary: "36 72% 44%",
    primaryDark: "36 80% 52%",
    gradientStart: "36 72% 44%",
    gradientEnd: "22 75% 48%",
    accent: "36 72% 95%",
    accentDark: "36 40% 12%",
    color: "bg-[#b8701a]"
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
