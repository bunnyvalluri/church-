"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useTheme } from "next-themes";

export type ColorTheme = "violet" | "emerald" | "ocean" | "crimson" | "gold" | "rose" | "sky" | "olive" | "earth" | "platinum";

export interface ColorPalette {
  name: string;
  primary: string;       // HSL string for light mode (e.g. "258 94% 50%")
  primaryDark: string;   // HSL string for dark mode
  gradientStart: string; // HSL string for gradient start
  gradientEnd: string;   // HSL string for gradient end
  accent: string;        // HSL string for light mode accent tint
  accentDark: string;    // HSL string for dark mode accent tint
  color: string;         // Tailwind base color class
  scale: {
    50: string;
    100: string;
    200: string;
    300: string;
    400: string;
    500: string;
    600: string;
    700: string;
    800: string;
    900: string;
    950: string;
  };
}

export const palettes: Record<ColorTheme, ColorPalette> = {
  violet: {
    name: "Purple Glory",
    primary: "258 94% 50%",
    primaryDark: "258 95% 65%",
    gradientStart: "258 94% 50%",
    gradientEnd: "280 90% 45%",
    accent: "258 94% 96%",
    accentDark: "258 40% 16%",
    color: "bg-[#8B5CF6]",
    scale: {
      50: "258 94% 96%",
      100: "258 94% 90%",
      200: "258 94% 82%",
      300: "258 94% 74%",
      400: "258 94% 64%",
      500: "258 94% 56%",
      600: "258 94% 50%",
      700: "258 94% 40%",
      800: "258 94% 30%",
      900: "258 94% 20%",
      950: "258 94% 12%"
    }
  },
  emerald: {
    name: "Emerald",
    primary: "160 80% 40%",
    primaryDark: "160 80% 50%",
    gradientStart: "160 80% 42%",
    gradientEnd: "175 80% 32%",
    accent: "160 84% 96%",
    accentDark: "160 40% 10%",
    color: "bg-[#10B981]",
    scale: {
      50: "160 84% 96%",
      100: "160 84% 90%",
      200: "160 80% 82%",
      300: "160 76% 70%",
      400: "160 76% 56%",
      500: "160 76% 46%",
      600: "160 80% 40%",
      700: "160 84% 30%",
      800: "160 84% 22%",
      900: "160 84% 15%",
      950: "160 84% 9%"
    }
  },
  ocean: {
    name: "Holy Blue",
    primary: "217 91% 50%",
    primaryDark: "217 95% 65%",
    gradientStart: "217 91% 52%",
    gradientEnd: "200 90% 42%",
    accent: "217 91% 96%",
    accentDark: "217 40% 12%",
    color: "bg-[#3B82F6]",
    scale: {
      50: "217 91% 96%",
      100: "217 91% 90%",
      200: "217 91% 82%",
      300: "217 91% 72%",
      400: "217 91% 62%",
      500: "217 91% 54%",
      600: "217 91% 50%",
      700: "217 91% 38%",
      800: "217 91% 28%",
      900: "217 91% 18%",
      950: "217 91% 11%"
    }
  },
  crimson: {
    name: "Crimson",
    primary: "0 80% 48%",
    primaryDark: "0 80% 60%",
    gradientStart: "0 80% 50%",
    gradientEnd: "350 78% 42%",
    accent: "0 85% 97%",
    accentDark: "0 40% 12%",
    color: "bg-[#DC2626]",
    scale: {
      50: "0 85% 97%",
      100: "0 85% 92%",
      200: "0 85% 84%",
      300: "0 80% 72%",
      400: "0 75% 60%",
      500: "0 75% 52%",
      600: "0 80% 48%",
      700: "0 84% 36%",
      800: "0 84% 26%",
      900: "0 84% 16%",
      950: "0 84% 9%"
    }
  },
  gold: {
    name: "Royal Gold",
    primary: "42 85% 42%",
    primaryDark: "42 85% 56%",
    gradientStart: "42 85% 45%",
    gradientEnd: "32 80% 38%",
    accent: "42 90% 96%",
    accentDark: "42 40% 12%",
    color: "bg-[#D4AF37]",
    scale: {
      50: "42 90% 96%",
      100: "42 90% 88%",
      200: "42 85% 78%",
      300: "42 80% 66%",
      400: "42 75% 54%",
      500: "42 75% 46%",
      600: "42 85% 42%",
      700: "42 85% 32%",
      800: "42 85% 23%",
      900: "42 85% 15%",
      950: "42 85% 9%"
    }
  },
  rose: {
    name: "Rose Covenant",
    primary: "340 70% 48%",
    primaryDark: "340 75% 62%",
    gradientStart: "340 70% 50%",
    gradientEnd: "355 65% 42%",
    accent: "340 85% 97%",
    accentDark: "340 30% 15%",
    color: "bg-[#cc5c7d]",
    scale: {
      50: "340 85% 97%",
      100: "340 85% 92%",
      200: "340 80% 84%",
      300: "340 75% 72%",
      400: "340 70% 60%",
      500: "340 65% 52%",
      600: "340 70% 48%",
      700: "340 75% 36%",
      800: "340 75% 26%",
      900: "340 75% 16%",
      950: "340 75% 10%"
    }
  },
  sky: {
    name: "Heavenly Sky",
    primary: "200 90% 42%",
    primaryDark: "200 90% 58%",
    gradientStart: "200 90% 45%",
    gradientEnd: "220 85% 40%",
    accent: "200 95% 96%",
    accentDark: "200 45% 12%",
    color: "bg-[#1349c5]",
    scale: {
      50: "200 95% 96%",
      100: "200 95% 90%",
      200: "200 90% 82%",
      300: "200 85% 70%",
      400: "200 85% 58%",
      500: "200 85% 48%",
      600: "200 90% 42%",
      700: "200 90% 32%",
      800: "200 90% 23%",
      900: "200 90% 15%",
      950: "200 90% 9%"
    }
  },
  olive: {
    name: "Anointed Olive",
    primary: "85 55% 36%",
    primaryDark: "85 55% 48%",
    gradientStart: "85 55% 38%",
    gradientEnd: "115 50% 30%",
    accent: "85 60% 96%",
    accentDark: "85 30% 10%",
    color: "bg-[#608020]",
    scale: {
      50: "85 60% 96%",
      100: "85 60% 90%",
      200: "85 55% 80%",
      300: "85 50% 66%",
      400: "85 50% 52%",
      500: "85 50% 42%",
      600: "85 55% 36%",
      700: "85 60% 27%",
      800: "85 60% 19%",
      900: "85 60% 13%",
      950: "85 60% 7%"
    }
  },
  earth: {
    name: "Sacred Earth",
    primary: "25 75% 40%",
    primaryDark: "25 75% 52%",
    gradientStart: "25 75% 42%",
    gradientEnd: "35 70% 35%",
    accent: "25 80% 96%",
    accentDark: "25 40% 12%",
    color: "bg-[#ba4c18]",
    scale: {
      50: "25 80% 96%",
      100: "25 80% 90%",
      200: "25 75% 80%",
      300: "25 70% 66%",
      400: "25 70% 54%",
      500: "25 70% 44%",
      600: "25 75% 40%",
      700: "25 80% 30%",
      800: "25 80% 21%",
      900: "25 80% 14%",
      950: "25 80% 8%"
    }
  },
  platinum: {
    name: "Divine Platinum",
    primary: "220 25% 42%",
    primaryDark: "220 25% 60%",
    gradientStart: "220 25% 45%",
    gradientEnd: "230 20% 38%",
    accent: "220 20% 96%",
    accentDark: "220 15% 20%",
    color: "bg-[#6b7c8f]",
    scale: {
      50: "220 20% 96%",
      100: "220 20% 90%",
      200: "220 20% 82%",
      300: "220 20% 70%",
      400: "220 20% 58%",
      500: "220 20% 48%",
      600: "220 25% 42%",
      700: "220 25% 32%",
      800: "220 25% 23%",
      900: "220 25% 15%",
      950: "220 25% 9%"
    }
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
    const p = palettes[theme] || palettes.violet;
    const isDark = resolvedTheme === "dark";

    const primaryColor = isDark ? p.primaryDark : p.primary;
    const accentColor = isDark ? p.accentDark : p.accent;

    root.style.setProperty("--primary", primaryColor);
    root.style.setProperty("--ring", primaryColor);
    root.style.setProperty("--accent", accentColor);
    
    // Gradient stops
    root.style.setProperty("--primary-gradient-start", p.gradientStart);
    root.style.setProperty("--primary-gradient-end", p.gradientEnd);
    
    // Full Palette Scale injection (50 through 950)
    root.style.setProperty("--purple-50-hsl", p.scale[50]);
    root.style.setProperty("--purple-100-hsl", p.scale[100]);
    root.style.setProperty("--purple-200-hsl", p.scale[200]);
    root.style.setProperty("--purple-300-hsl", p.scale[300]);
    root.style.setProperty("--purple-400-hsl", p.scale[400]);
    root.style.setProperty("--purple-500-hsl", p.scale[500]);
    root.style.setProperty("--purple-600-hsl", p.scale[600]);
    root.style.setProperty("--purple-700-hsl", p.scale[700]);
    root.style.setProperty("--purple-800-hsl", p.scale[800]);
    root.style.setProperty("--purple-900-hsl", p.scale[900]);
    root.style.setProperty("--purple-950-hsl", p.scale[950]);

    // Data theme attribute
    root.setAttribute("data-color-theme", theme);
    
    // Persist
    localStorage.setItem("kcm-color-theme", theme);
  }, [theme, resolvedTheme]);

  const setTheme = (t: ColorTheme) => {
    if (palettes[t]) {
      setThemeState(t);
    }
  };

  return (
    <ColorThemeContext.Provider value={{ theme, setTheme, currentPalette: palettes[theme] || palettes.violet }}>
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
