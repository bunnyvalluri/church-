"use client";

import React, { memo } from "react";
import Link from "next/link";
import { User, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface MemberLoginButtonProps {
  /** "desktop" = full gradient pill, "tablet" = medium, "drawer" = full-width block */
  variant?: "desktop" | "tablet" | "drawer";
  onClick?: () => void;
  label?: string;
}

/**
 * MemberLoginButton — Gradient pill CTA button with localized text support.
 *
 * Desktop: Visible, full pill with shimmer effect
 * Tablet:  Visible, compact responsive size
 * Mobile:  Hidden in nav bar, rendered inside MobileDrawer only
 */
const MemberLoginButton = memo(function MemberLoginButton({
  variant = "desktop",
  onClick,
  label = "Member Login",
}: MemberLoginButtonProps) {
  const baseClasses = cn(
    "relative font-extrabold text-white overflow-hidden backdrop-blur-2xl inline-flex items-center justify-center shrink-0",
    "shadow-[0_4px_16px_rgba(124,58,237,0.4)]",
    "border border-white/40 dark:border-white/20",
    "transition-all duration-300 cubic-bezier(0.16, 1, 0.3, 1)",
    "hover:scale-[1.02] active:scale-[0.98]",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
    "whitespace-nowrap select-none group"
  );

  const sizeClasses = {
    desktop: "px-3 sm:px-4 py-2 text-xs sm:text-[13px] xl:text-sm rounded-full",
    tablet: "px-2.5 sm:px-3.5 py-1.5 text-[11px] sm:text-xs rounded-full",
    drawer: "w-full py-3 px-4 text-xs sm:text-sm flex items-center justify-between tracking-wide rounded-2xl shadow-lg shadow-purple-600/30",
  }[variant];

  return (
    <Link
      href="/login"
      onClick={onClick}
      className={cn(baseClasses, sizeClasses)}
      aria-label={label}
    >
      {/* Liquid background gradient layer */}
      <span
        className="absolute inset-0 bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 group-hover:from-violet-500 group-hover:to-indigo-500 transition-all duration-300"
        aria-hidden="true"
      />

      {variant === "drawer" ? (
        <div className="relative z-10 flex items-center justify-between w-full">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-white/20 flex items-center justify-center shrink-0">
              <User className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-extrabold tracking-wide" suppressHydrationWarning>{label}</span>
          </div>
          <ChevronRight className="w-4 h-4 text-white/80 group-hover:translate-x-0.5 transition-transform shrink-0" />
        </div>
      ) : (
        <span className="relative z-10 font-black tracking-wide" suppressHydrationWarning>{label}</span>
      )}
    </Link>
  );
});

export default MemberLoginButton;
