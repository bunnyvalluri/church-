"use client";

import React, { memo } from "react";
import { cn } from "@/lib/utils";
import BranchSelector from "@/components/BranchSelector";
import PaletteToggle from "@/components/PaletteToggle";
import MemberLoginButton from "./MemberLoginButton";

interface NavigationActionsProps {
  /** Shows full member login button (desktop/tablet) */
  showLogin?: boolean;
  /** Shows settings/palette toggle */
  showSettings?: boolean;
  /** Compact mode for smaller spaces */
  compact?: boolean;
}

/**
 * NavigationActions — right-side cluster: BranchSelector + Settings + Login
 *
 * Desktop (≥lg):   BranchSelector + Settings + Login button
 * Tablet (sm–lg):  BranchSelector + (Settings hidden) + Login button
 * Mobile (<sm):    BranchSelector only (hamburger is separate)
 */
const NavigationActions = memo(function NavigationActions({
  showLogin = true,
  showSettings = true,
  compact = false,
}: NavigationActionsProps) {
  return (
    <div
      className={cn(
        "flex items-center flex-shrink-0",
        compact ? "gap-1" : "gap-1.5 sm:gap-2"
      )}
    >
      {/* Branch Selector — always visible */}
      <div className="flex-shrink-0">
        <BranchSelector />
      </div>

      {/* Settings / Preferences — desktop only (lg+) */}
      {showSettings && (
        <div className="hidden lg:block flex-shrink-0">
          <PaletteToggle showPreferences={true} />
        </div>
      )}

      {/* Member Login — tablet+ (sm+), hidden on mobile */}
      {showLogin && (
        <div className="hidden sm:block flex-shrink-0">
          <MemberLoginButton variant="tablet" />
        </div>
      )}
    </div>
  );
});

export default NavigationActions;
