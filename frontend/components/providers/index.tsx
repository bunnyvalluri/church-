"use client";

import { useState } from "react";
import { ThemeProvider } from "next-themes";
import { AuthProvider } from "./AuthProvider";
import { LanguageProvider } from "./LanguageProvider";
import { ColorThemeProvider } from "./ColorThemeProvider";
import { BranchProvider } from "./BranchProvider";
import RealtimePopupProvider from "./RealtimePopupProvider";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";


export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            refetchOnWindowFocus: false,
            staleTime: 5 * 60 * 1000, // 5 minutes cache default
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
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
                <RealtimePopupProvider>{children}</RealtimePopupProvider>
              </BranchProvider>
            </AuthProvider>
          </LanguageProvider>
        </ColorThemeProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
