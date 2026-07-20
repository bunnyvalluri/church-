"use client";

import React, { memo } from "react";
import { cn } from "@/lib/utils";
import NavigationItem from "./NavigationItem";
import { NAV_STYLES } from "./constants";
import { NavItem } from "./types";

interface DesktopMenuProps {
  navItems: NavItem[];
  activeSection: string;
  pathname: string;
  resolveHref: (href: string) => string;
}

/**
 * DesktopMenu — Full navigation for ≥1025px (lg+)
 *
 * Shows all nav items inline in a centered flex row.
 * Memoized to prevent re-render on unrelated state changes.
 */
const DesktopMenu = memo(function DesktopMenu({
  navItems,
  activeSection,
  pathname,
  resolveHref,
}: DesktopMenuProps) {
  return (
    <nav
      aria-label="Primary navigation"
      className={cn(
        "hidden md:flex",
        "items-center",
        // Spacing between items — scales from small laptop to large desktop
        "gap-0.5 md:gap-1 lg:gap-1.5 xl:gap-2",
        // Horizontal flex center
        "flex-1 justify-center",
        // Prevent overflow clipping
        "min-w-0"
      )}
    >
      {navItems.map((item) => {
        const isActive = item.href.startsWith("/")
          ? pathname === item.href || pathname.startsWith(item.href + "/")
          : activeSection === item.href.replace("#", "");
        const styles = NAV_STYLES[item.href] ?? NAV_STYLES["#home"];

        return (
          <NavigationItem
            key={item.href}
            item={item}
            isActive={isActive}
            styles={styles}
            resolvedHref={resolveHref(item.href)}
            variant="desktop"
          />
        );
      })}
    </nav>
  );
});

export default DesktopMenu;
