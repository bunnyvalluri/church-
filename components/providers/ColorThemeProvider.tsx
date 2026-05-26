"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useTheme } from "next-themes";

export type ColorTheme = "violet" | "emerald" | "ocean" | "crimson" | "gold";

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
    name: "Royal Violet",
    primary: "262 83% 58%",
    primaryDark: "262 83% 65%",
    gradientStart: "262 83% 58%",
    gradientEnd: "280 90% 65%",
    accent: "262 83% 96%",
    accentDark: "262 40% 16%",
    color: "bg-purple-600"
  },
  emerald: {
    name: "Emerald Glory",
    primary: "142 76% 36%",
    primaryDark: "142 70% 45%",
    gradientStart: "142 76% 36%",
    gradientEnd: "160 84% 39%",
    accent: "142 76% 95%",
    accentDark: "142 40% 12%",
    color: "bg-emerald-600"
  },
  ocean: {
    name: "Ocean Grace",
    primary: "200 95% 48%",
    primaryDark: "200 90% 55%",
    gradientStart: "200 95% 48%",
    gradientEnd: "185 85% 45%",
    accent: "200 95% 95%",
    accentDark: "200 40% 14%",
    color: "bg-sky-500"
  },
  crimson: {
    name: "Crimson Salvation",
    primary: "346 84% 50%",
    primaryDark: "346 80% 58%",
    gradientStart: "346 84% 50%",
    gradientEnd: "325 80% 48%",
    accent: "346 84% 96%",
    accentDark: "346 40% 15%",
    color: "bg-rose-600"
  },
  gold: {
    name: "Anointed Amber",
    primary: "38 92% 50%",
    primaryDark: "38 85% 55%",
    gradientStart: "38 92% 50%",
    gradientEnd: "25 90% 50%",
    accent: "38 92% 95%",
    accentDark: "38 40% 14%",
    color: "bg-amber-500"
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
