"use client";

import React, { memo } from "react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/components/providers/LanguageProvider";
import BranchSelector from "@/components/BranchSelector";
import LanguageToggle from "@/components/LanguageToggle";
import PaletteToggle from "@/components/PaletteToggle";
import MemberLoginButton from "./MemberLoginButton";

interface NavigationActionsProps {
  /** Shows full member login button (desktop/tablet) */
  showLogin?: boolean;
  /** Shows settings/palette toggle */
  showSettings?: boolean;
  /** Shows dedicated language toggle */
  showLanguage?: boolean;
  /** Compact mode for smaller spaces */
  compact?: boolean;
}

/**
 * NavigationActions — right-side cluster: BranchSelector + Language + Settings + Login
 *
 * Desktop (≥lg):   BranchSelector + Language + Settings + Login button
 * Tablet (sm–lg):  BranchSelector + Language + Login button
 * Mobile (<sm):    BranchSelector only (Language & Settings inside mobile drawer)
 */
const NavigationActions = memo(function NavigationActions({
  showLogin = true,
  showSettings = true,
  showLanguage = true,
  compact = false,
}: NavigationActionsProps) {
  const { t } = useLanguage();

  return (
    <div
      className={cn(
        "flex items-center flex-shrink-0 z-10 relative",
        compact ? "gap-1" : "gap-1 min-[360px]:gap-1.5 sm:gap-2"
      )}
    >
      {/* Branch Selector — always visible */}
      <div className="flex-shrink-0">
        <BranchSelector />
      </div>

      {/* Language Selector — visible on tablet+ (sm+) */}
      {showLanguage && (
        <div className="hidden sm:block flex-shrink-0">
          <LanguageToggle />
        </div>
      )}

      {/* Settings / Preferences — desktop only (xl+) */}
      {showSettings && (
        <div className="hidden xl:block flex-shrink-0">
          <PaletteToggle showPreferences={true} />
        </div>
      )}

      {/* Member Login — tablet+ (md+), hidden on mobile */}
      {showLogin && (
        <div className="hidden md:block flex-shrink-0">
          <MemberLoginButton variant="tablet" label={t.nav.login} />
        </div>
      )}
    </div>
  );
});

export default NavigationActions;
