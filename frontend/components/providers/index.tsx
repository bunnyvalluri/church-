"use client";

import { ThemeProvider } from "next-themes";
import { AuthProvider } from "./AuthProvider";
import { LanguageProvider } from "./LanguageProvider";
import { ColorThemeProvider } from "./ColorThemeProvider";

console.log("DEBUG PROVIDERS TYPES:");
console.log("  ThemeProvider:", typeof ThemeProvider);
console.log("  ColorThemeProvider:", typeof ColorThemeProvider);
console.log("  LanguageProvider:", typeof LanguageProvider);
console.log("  AuthProvider:", typeof AuthProvider);

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="light"
      enableSystem={false}
      disableTransitionOnChange
      storageKey="kcm-theme"
    >
      <ColorThemeProvider>
        <LanguageProvider>
          <AuthProvider>
            {children}
          </AuthProvider>
        </LanguageProvider>
      </ColorThemeProvider>
    </ThemeProvider>
  );
}
