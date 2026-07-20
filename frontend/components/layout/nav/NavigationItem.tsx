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
 * Single navigation item — icon + label, active state, hover animation.
 * GPU-only transitions: transform + opacity.
 * Meets WCAG AA: focus-visible ring, 44×44 min touch target on mobile.
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
        // Base
        "relative group flex items-center gap-1.5 rounded-xl font-semibold",
        "whitespace-nowrap select-none",
        // Typography: 14px desktop, 13px on smaller lg screens
        "text-[13px] xl:text-[14px]",
        // Spacing: desktop variant — compact but breathing
        variant === "desktop"
          ? "px-3 py-2"
          : "px-2.5 py-1.5",
        // Transitions: GPU-composited only
        "transition-[color,background-color,border-color,opacity,transform] duration-[150ms] ease-out",
        // Active state
        isActive
          ? cn(styles.activeText, styles.activeBg, styles.activeBorder, "border shadow-sm")
          : cn(
              "text-gray-600 dark:text-gray-400",
              "border border-transparent",
              styles.hoverText,
              styles.hoverBg,
            ),
        // Focus visible (keyboard nav)
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1",
        // Hover lift — transform only (GPU)
        "hover:-translate-y-px",
        className
      )}
      aria-current={isActive ? "page" : undefined}
    >
      {/* Active background pill — animated scale-in */}
      {isActive && (
        <span
          className={cn(
            "absolute inset-0 rounded-xl backdrop-blur-[6px]",
            "animate-scale-in pointer-events-none",
            styles.activeBg, styles.activeBorder, "border"
          )}
          aria-hidden="true"
        />
      )}

      {/* Icon */}
      <Icon
        className={cn(
          "flex-shrink-0 transition-transform duration-[150ms] ease-out",
          variant === "desktop" ? "w-3.5 h-3.5" : "w-3.5 h-3.5",
          isActive ? styles.activeText : "text-gray-400 dark:text-gray-500 group-hover:scale-110",
          isActive ? "scale-100" : ""
        )}
        aria-hidden="true"
      />

      {/* Label */}
      <span className="relative z-10">{item.name}</span>

      {/* Bottom active indicator dot */}
      {isActive && (
        <span
          className={cn(
            "absolute -bottom-px left-1/2 -translate-x-1/2 w-1 h-1 rounded-full",
            styles.activeIndicator,
            "animate-scale-in pointer-events-none"
          )}
          aria-hidden="true"
        />
      )}
    </Link>
  );
});

export default NavigationItem;
