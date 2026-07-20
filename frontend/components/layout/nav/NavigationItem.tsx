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
        // Base
        "relative group flex items-center gap-1 font-medium",
        "whitespace-nowrap select-none",
        // Typography
        "text-[12.5px] xl:text-[13px]",
        // Spacing — compact to fit all items
        variant === "desktop"
          ? "px-2 py-2"
          : "px-1.5 py-1.5",
        // Transitions
        "transition-colors duration-150 ease-out",
        // Active state — colored text only, no background box
        isActive
          ? cn(styles.activeText, "font-semibold")
          : cn(
              "text-gray-600 dark:text-gray-200",
              styles.hoverText,
              "dark:hover:text-white"
            ),
        // Focus visible
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1 rounded-lg",
        // Hover lift
        "hover:-translate-y-px",
        className
      )}
      aria-current={isActive ? "page" : undefined}
    >
      {/* Icon — small, always present */}
      <Icon
        className={cn(
          "flex-shrink-0 w-3 h-3 transition-all duration-150",
          isActive
            ? styles.activeText
            : "text-gray-400 dark:text-gray-300 group-hover:scale-110",
        )}
        aria-hidden="true"
      />

      {/* Label */}
      <span className="relative">{item.name}</span>

      {/* Bottom active indicator — sleek underline bar */}
      <span
        className={cn(
          "absolute bottom-0 left-1/2 -translate-x-1/2 h-0.5 rounded-full",
          "transition-[width,opacity] duration-200 ease-out",
          styles.activeIndicator,
          isActive
            ? "w-4/5 opacity-100"
            : "w-0 opacity-0 group-hover:w-1/2 group-hover:opacity-40"
        )}
        aria-hidden="true"
      />
    </Link>
  );
});

export default NavigationItem;
