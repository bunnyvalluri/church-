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
  // On md–xl (768–1279px) show 3 key items inline + MoreDropdown
  const primaryKeys = ["#home", "#about", "/ngo"];
  const primaryItems = navItems.filter((item) => primaryKeys.includes(item.href));
  const overflowItems = navItems.filter((item) => !primaryKeys.includes(item.href));

  return (
    <nav
      aria-label="Primary navigation"
      className={cn(
        "hidden md:flex xl:hidden",
        "flex-1 items-center justify-center min-w-0",
        "mx-1 lg:mx-2 px-0.5 lg:px-1",
        "z-10"
      )}
    >
      <div className="flex items-center gap-1 lg:gap-1.5 p-0.5 shrink-0">
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
