"use client";

import { ThemeProvider } from "next-themes";
import { AuthProvider } from "./AuthProvider";
import { LanguageProvider } from "./LanguageProvider";
import { ColorThemeProvider } from "./ColorThemeProvider";
import { BranchProvider } from "./BranchProvider";
import RealtimePopupProvider from "./RealtimePopupProvider";

console.log("DEBUG PROVIDERS TYPES:");
console.log("  ThemeProvider:", typeof ThemeProvider);
console.log("  ColorThemeProvider:", typeof ColorThemeProvider);
console.log("  LanguageProvider:", typeof LanguageProvider);
console.log("  AuthProvider:", typeof AuthProvider);
console.log("  BranchProvider:", typeof BranchProvider);

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
            <BranchProvider>
              <RealtimePopupProvider>
                {children}
              </RealtimePopupProvider>
            </BranchProvider>
          </AuthProvider>
        </LanguageProvider>
      </ColorThemeProvider>
    </ThemeProvider>
  );
}
