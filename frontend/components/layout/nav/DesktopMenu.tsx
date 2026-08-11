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
        "hidden xl:flex",
        "flex-shrink-0 items-center justify-center",
        "px-1 xl:px-2"
      )}
    >
      {/* Apple Floating Liquid Glass Segmented Dock */}
      <div className="flex items-center gap-0.5 lg:gap-1 xl:gap-1.5 p-1 rounded-full bg-white/40 dark:bg-slate-900/40 backdrop-blur-2xl border border-white/60 dark:border-white/15 shadow-[0_4px_24px_-2px_rgba(0,0,0,0.06),0_1px_2px_rgba(255,255,255,0.7)_inset] dark:shadow-[0_4px_24px_-2px_rgba(0,0,0,0.5),0_1px_1px_rgba(255,255,255,0.1)_inset]">
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
