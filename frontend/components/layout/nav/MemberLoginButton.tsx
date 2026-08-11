"use client";

import React, { memo } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface MemberLoginButtonProps {
  /** "desktop" = full gradient pill, "tablet" = medium, "drawer" = full-width block */
  variant?: "desktop" | "tablet" | "drawer";
  onClick?: () => void;
  label?: string;
}

/**
 * MemberLoginButton — Gradient pill CTA button.
 *
 * Desktop: Visible, full pill with shimmer effect
 * Tablet:  Visible, compact size
 * Mobile:  Hidden in nav bar, rendered inside MobileDrawer only
 */
const MemberLoginButton = memo(function MemberLoginButton({
  variant = "desktop",
  onClick,
  label = "Member Login",
}: MemberLoginButtonProps) {
  const baseClasses = cn(
    "relative font-extrabold text-white overflow-hidden backdrop-blur-2xl inline-flex items-center justify-center",
    "rounded-full shadow-[0_4px_16px_rgba(124,58,237,0.4)]",
    "border border-white/40 dark:border-white/20",
    "transition-all duration-300 cubic-bezier(0.16, 1, 0.3, 1)",
    "hover:scale-[1.03] active:scale-[0.97]",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
    "whitespace-nowrap select-none group"
  );

  const sizeClasses = {
    desktop: "px-4 py-2 text-[13px] xl:text-sm",
    tablet: "px-3.5 py-1.5 text-xs",
    drawer: "w-full py-3.5 text-sm flex items-center justify-center tracking-wide",
  }[variant];

  return (
    <Link
      href="/login"
      onClick={onClick}
      className={cn(baseClasses, sizeClasses)}
      aria-label="Member Login"
    >
      {/* Liquid background gradient layer */}
      <span
        className="absolute inset-0 bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 group-hover:from-violet-500 group-hover:to-indigo-500 transition-all duration-300"
        aria-hidden="true"
      />

      <span className="relative z-10 font-black tracking-wide">{label}</span>
    </Link>
  );
});

export default MemberLoginButton;
