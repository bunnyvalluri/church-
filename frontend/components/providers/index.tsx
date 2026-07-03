"use client";

import { ThemeProvider } from "next-themes";
import { AuthProvider } from "./AuthProvider";
import { LanguageProvider } from "./LanguageProvider";
import { ColorThemeProvider } from "./ColorThemeProvider";
import { BranchProvider } from "./BranchProvider";
import RealtimePopupProvider from "./RealtimePopupProvider";

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
