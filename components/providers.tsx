"use client";

import { ThemeProvider } from "next-themes";
import { AuthProvider } from "@/components/providers/AuthProvider";
import { LanguageProvider } from "@/components/providers/LanguageProvider";
import { ColorThemeProvider } from "@/components/providers/ColorThemeProvider";

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

