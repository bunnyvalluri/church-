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
    "relative font-bold text-white overflow-hidden",
    "rounded-xl shadow-md",
    // GPU transitions only
    "transition-[transform,box-shadow,opacity] duration-[150ms] ease-out",
    "hover:shadow-violet-500/30 hover:shadow-lg",
    "hover:-translate-y-px active:translate-y-0 active:scale-95",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
    "whitespace-nowrap select-none group"
  );

  const sizeClasses = {
    desktop: "px-4 py-2 text-[13px] xl:text-sm",
    tablet: "px-3 py-1.5 text-xs",
    drawer: "w-full py-3 text-sm flex items-center justify-center",
  }[variant];

  return (
    <Link
      href="/login"
      onClick={onClick}
      className={cn(baseClasses, sizeClasses)}
      aria-label="Member Login"
    >
      {/* Gradient background layer */}
      <span
        className={cn(
          "absolute inset-0 bg-gradient-to-r from-violet-600 via-purple-600 to-violet-600",
          "bg-[length:200%_100%] bg-left",
          "group-hover:bg-right transition-[background-position] duration-500 ease-out"
        )}
        aria-hidden="true"
      />
      {/* Shimmer overlay */}
      <span
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
        style={{
          background: "linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.15) 50%, transparent 60%)",
        }}
        aria-hidden="true"
      />
      <span className="relative z-10">{label}</span>
    </Link>
  );
});

export default MemberLoginButton;
