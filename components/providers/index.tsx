"use client";

import { ThemeProvider } from "next-themes";
import { AuthProvider } from "./AuthProvider";
import { LanguageProvider } from "./LanguageProvider";
import { ColorThemeProvider } from "./ColorThemeProvider";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <ThemeProvider
        attribute="class"
        defaultTheme="light"
        enableSystem={false}
        disableTransitionOnChange
        storageKey="kcm-theme"
      >
        <ColorThemeProvider>
          <LanguageProvider>
            {children}
          </LanguageProvider>
        </ColorThemeProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}
