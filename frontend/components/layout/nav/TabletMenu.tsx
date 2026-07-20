"use client";

import React, { memo } from "react";
import { cn } from "@/lib/utils";
import NavigationItem from "./NavigationItem";
import MoreDropdown from "./MoreDropdown";
import { NAV_STYLES, PRIMARY_NAV_KEYS, OVERFLOW_NAV_KEYS } from "./constants";
import { NavItem } from "./types";

interface TabletMenuProps {
  navItems: NavItem[];
  activeSection: string;
  pathname: string;
  resolveHref: (href: string) => string;
}

/**
 * TabletMenu — Visible at sm–lg (541–1024px)
 *
 * Shows 4 primary nav items inline + "More" dropdown for overflow.
 * Hidden below sm, hidden at lg+ (DesktopMenu takes over).
 */
const TabletMenu = memo(function TabletMenu({
  navItems,
  activeSection,
  pathname,
  resolveHref,
}: TabletMenuProps) {
  const primaryItems = navItems.filter((item) => PRIMARY_NAV_KEYS.includes(item.href));
  const overflowItems = navItems.filter((item) => OVERFLOW_NAV_KEYS.includes(item.href));

  return (
    <nav
      aria-label="Primary navigation"
      className={cn(
        // Visible sm–lg only
        "hidden sm:flex lg:hidden",
        "items-center gap-0.5",
        "flex-1 justify-center",
        "min-w-0 overflow-hidden"
      )}
    >
      {/* Primary 4 items */}
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
    </nav>
  );
});

export default TabletMenu;
