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
  /** Shows settings/palette toggle (default false to keep navbar clean) */
  showSettings?: boolean;
  /** Shows dedicated language toggle */
  showLanguage?: boolean;
  /** Compact mode for smaller spaces */
  compact?: boolean;
}

/**
 * NavigationActions — Right-side action cluster: BranchSelector + Language + MemberLogin
 *
 * Designed with senior UX principles:
 *   • Clean visual hierarchy without redundant preference gear icons
 *   • Guaranteed flex-shrink-0 so buttons are never squashed or pushed off screen
 *   • Smooth responsive gaps across breakpoints
 */
const NavigationActions = memo(function NavigationActions({
  showLogin = true,
  showSettings = false,
  showLanguage = true,
  compact = false,
}: NavigationActionsProps) {
  const { t } = useLanguage();

  return (
    <div
      className={cn(
        "flex items-center flex-shrink-0 shrink-0 z-10 relative",
        compact ? "gap-1" : "gap-1.5 sm:gap-2"
      )}
    >
      {/* Branch Selector — visible on tablet+ (sm+) */}
      <div className="hidden sm:block flex-shrink-0 shrink-0">
        <BranchSelector />
      </div>

      {/* Language Selector — visible on tablet+ (sm+) */}
      {showLanguage && (
        <div className="hidden sm:block flex-shrink-0 shrink-0">
          <LanguageToggle />
        </div>
      )}

      {/* Optional Settings/Palette Toggle — only when explicitly enabled */}
      {showSettings && (
        <div className="hidden 2xl:block flex-shrink-0 shrink-0">
          <PaletteToggle showPreferences={true} />
        </div>
      )}

      {/* Member Login — tablet+ (md+), hidden on mobile */}
      {showLogin && (
        <div className="hidden md:block flex-shrink-0 shrink-0">
          <MemberLoginButton variant="tablet" label={t.nav.login} />
        </div>
      )}
    </div>
  );
});

export default NavigationActions;
