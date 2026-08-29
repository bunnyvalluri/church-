"use client";

import React, { memo } from "react";
import { cn } from "@/lib/utils";
import NavigationItem from "./NavigationItem";
import MoreDropdown from "./MoreDropdown";
import { NAV_STYLES } from "./constants";
import { NavItem } from "./types";

interface TabletMenuProps {
  navItems: NavItem[];
  activeSection: string;
  pathname: string;
  resolveHref: (href: string) => string;
}

/**
 * TabletMenu — Responsive navigation dock for tablets and medium laptops (md–xl: 768–1279px).
 *
 * Dynamically keeps the dock compact so language toggles, branch selector, and login CTA
 * have comfortable breathing room across all languages (English, Telugu, Hindi).
 */
const TabletMenu = memo(function TabletMenu({
  navItems,
  activeSection,
  pathname,
  resolveHref,
}: TabletMenuProps) {
  // On md–lg (768–1023px) show 3 items inline; on lg–xl (1024–1279px) show 4 items inline
  const primaryKeys = ["#home", "#about", "/ngo"];
  const primaryItems = navItems.filter((item) => primaryKeys.includes(item.href));
  const overflowItems = navItems.filter((item) => !primaryKeys.includes(item.href));

  return (
    <nav
      aria-label="Primary navigation"
      className={cn(
        "hidden md:flex xl:hidden",
        "flex-shrink items-center justify-center min-w-0",
        "px-1 lg:px-2"
      )}
    >
      {/* Apple Floating Liquid Glass Segmented Dock */}
      <div className="flex items-center gap-0.5 lg:gap-1 p-1 rounded-full bg-white/40 dark:bg-slate-900/40 backdrop-blur-2xl border border-white/60 dark:border-white/15 shadow-[0_4px_24px_-2px_rgba(0,0,0,0.06)] shrink-0">
        {/* Primary items */}
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
              variant="tablet"
            />
          );
        })}

        {/* "More" overflow dropdown */}
        {overflowItems.length > 0 && (
          <MoreDropdown
            items={overflowItems}
            activeSection={activeSection}
            pathname={pathname}
            resolveHref={resolveHref}
          />
        )}
      </div>
    </nav>
  );
});

export default TabletMenu;
