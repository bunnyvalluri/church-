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
        "hidden lg:flex",
        "flex-1 items-center justify-center",
        "min-w-0 max-w-full px-1 lg:px-2"
      )}
    >
      <div className="flex items-center gap-0.5 lg:gap-1 xl:gap-2.5 mx-auto max-w-full">
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
      </div>
    </nav>
  );
});

export default DesktopMenu;
