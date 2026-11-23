"use client";

import React, { memo } from "react";
import { cn } from "@/lib/utils";
import NavigationItem from "./NavigationItem";
import MoreDropdown from "./MoreDropdown";
import { NAV_STYLES } from "./constants";
import { NavItem } from "./types";

interface DesktopMenuProps {
  navItems: NavItem[];
  activeSection: string;
  pathname: string;
  resolveHref: (href: string) => string;
}

/**
 * DesktopMenu — Senior Responsive Navigation System
 *
 * Responsiveness:
 *   • 1280px–1535px (xl): 5 core items inline + sleek "More ▾" dropdown for overflow
 *   • ≥1536px (2xl): All 8 items inline with comfortable widescreen breathing room
 *   • Eliminates double-dock nesting ("pill inside a pill")
 *   • Guarantees 0px horizontal overflow across all display scalings and laptop resolutions
 */
const DesktopMenu = memo(function DesktopMenu({
  navItems,
  activeSection,
  pathname,
  resolveHref,
}: DesktopMenuProps) {
  // 5 core items for standard laptops & scaled displays (1280px–1535px)
  const primaryKeys = ["#home", "#about", "/ngo", "#services", "#events"];
  const primaryItems = navItems.filter((item) => primaryKeys.includes(item.href));
  const overflowItems = navItems.filter((item) => !primaryKeys.includes(item.href));

  return (
    <nav
      aria-label="Primary navigation"
      className={cn(
        "hidden xl:flex",
        "flex-1 items-center justify-center min-w-0",
        "px-2"
      )}
    >
      {/* ── Tier 1: 1280px–1535px (xl) — 5 Primary items + MoreDropdown ── */}
      <div className="flex 2xl:hidden items-center gap-1 xl:gap-1.5 p-0.5">
        {primaryItems.map((item) => {
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

        {overflowItems.length > 0 && (
          <MoreDropdown
            items={overflowItems}
            activeSection={activeSection}
            pathname={pathname}
            resolveHref={resolveHref}
          />
        )}
      </div>

      {/* ── Tier 2: ≥1536px (2xl) — Full 8 items inline ── */}
      <div className="hidden 2xl:flex items-center gap-1.5 p-0.5">
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
