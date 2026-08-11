"use client";

import React, { memo } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { NavItem, NavStyles } from "./types";

interface NavigationItemProps {
  item: NavItem;
  isActive: boolean;
  styles: NavStyles;
  resolvedHref: string;
  /** If "desktop" uses full label; "tablet" may use icon only if needed */
  variant?: "desktop" | "tablet";
  onClick?: () => void;
  className?: string;
}

/**
 * Single navigation item — clean underline active state, no boxy pill.
 * GPU-only transitions: transform + opacity.
 * Meets WCAG AA: focus-visible ring.
 */
const NavigationItem = memo(function NavigationItem({
  item,
  isActive,
  styles,
  resolvedHref,
  variant = "desktop",
  onClick,
  className,
}: NavigationItemProps) {
  const Icon = item.icon;

  return (
    <Link
      href={resolvedHref}
      onClick={onClick}
      className={cn(
        // Base Apple Liquid Glass button
        "apple-liquid-glass-btn relative group flex items-center gap-1.5 font-bold",
        "whitespace-nowrap select-none overflow-hidden rounded-full",
        "text-[12px] lg:text-[12.5px] xl:text-[13.5px] 2xl:text-[14px]",
        variant === "desktop"
          ? "px-2.5 py-1.5 lg:px-3 lg:py-1.5 xl:px-3.5 xl:py-2"
          : "px-2 py-1 md:px-2.5 md:py-1.5",
        // Transitions
        "transition-all duration-300 cubic-bezier(0.16, 1, 0.3, 1)",
        // Active vs Inactive Liquid Glass Styling
        isActive
          ? cn(
              "bg-white/95 dark:bg-white/20",
              styles.activeText,
              styles.liquidBorderGlow,
              "border shadow-sm font-extrabold"
            )
          : cn(
              "text-gray-700 dark:text-gray-200",
              "border border-transparent",
              "hover:bg-white/60 dark:hover:bg-white/12",
              "hover:scale-[1.03] active:scale-[0.97]",
              styles.hoverText
            ),
        // Focus visible ring
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1",
        className
      )}
      aria-current={isActive ? "page" : undefined}
    >
      {/* Morphing Liquid Fluid Blob Background */}
      <div
        className={cn(
          "absolute -inset-3 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-md bg-gradient-to-r animate-liquid-blob pointer-events-none",
          styles.liquidBlobGradient,
          isActive && "opacity-75"
        )}
      />

      {/* Label */}
      <span className="relative z-10 tracking-tight font-extrabold">{item.name}</span>

      {/* Bottom active indicator bar */}
      <span
        className={cn(
          "absolute bottom-0 left-1/2 -translate-x-1/2 h-0.5 rounded-full z-10",
          "transition-[width,opacity] duration-300 ease-out",
          styles.activeIndicator,
          isActive
            ? "w-3/4 opacity-100 shadow-[0_0_8px_rgba(139,92,246,0.6)]"
            : "w-0 opacity-0 group-hover:w-1/2 group-hover:opacity-50"
        )}
        aria-hidden="true"
      />
    </Link>
  );
});

export default NavigationItem;
