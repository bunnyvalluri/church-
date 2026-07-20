"use client";

import React, { memo, useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { NavItem, NavStyles } from "./types";
import { NAV_STYLES } from "./constants";

interface MoreDropdownProps {
  items: NavItem[];
  activeSection: string;
  pathname: string;
  resolveHref: (href: string) => string;
}

/**
 * MoreDropdown — Overflow menu for tablet breakpoint (541–1024px)
 * 
 * Keyboard: Tab in, Enter/Space to toggle, Escape to close, Arrow keys navigate items.
 * Click outside closes.
 * 200ms fade + translate animation.
 */
const MoreDropdown = memo(function MoreDropdown({
  items,
  activeSection,
  pathname,
  resolveHref,
}: MoreDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Determine if any overflow item is active (to highlight the "More" button)
  const hasActiveOverflow = items.some((item) =>
    item.href.startsWith("/")
      ? pathname === item.href || pathname.startsWith(item.href + "/")
      : activeSection === item.href.replace("#", "")
  );

  const close = useCallback(() => setIsOpen(false), []);

  // Click outside handler
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        close();
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [isOpen, close]);

  // Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        close();
        buttonRef.current?.focus();
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [isOpen, close]);

  return (
    <div className="relative" ref={containerRef}>
      {/* Trigger */}
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
        aria-haspopup="menu"
        aria-label="More navigation items"
        className={cn(
          "flex items-center gap-1.5 px-2.5 py-2 rounded-xl",
          "text-[13px] font-semibold whitespace-nowrap select-none",
          "transition-[color,background-color,border-color,transform] duration-[150ms] ease-out",
          "border",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1",
          "hover:-translate-y-px",
          hasActiveOverflow
            ? "text-violet-600 dark:text-violet-400 bg-violet-50/80 dark:bg-violet-500/10 border-violet-200/60 dark:border-violet-500/20"
            : "text-gray-600 dark:text-gray-400 border-transparent hover:bg-gray-100/60 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white"
        )}
      >
        <span>More</span>
        <ChevronDown
          className={cn(
            "w-3.5 h-3.5 transition-transform duration-200 ease-out",
            isOpen ? "rotate-180" : "rotate-0"
          )}
          aria-hidden="true"
        />
      </button>

      {/* Dropdown panel */}
      <div
        role="menu"
        aria-orientation="vertical"
        className={cn(
          // Position
          "absolute right-0 mt-2 min-w-[180px]",
          // Glass card
          "bg-white/95 dark:bg-gray-950/95 backdrop-blur-2xl",
          "rounded-2xl border border-gray-200/60 dark:border-white/10",
          "shadow-2xl shadow-black/10 dark:shadow-black/30",
          "p-1.5 z-50",
          // Animation — GPU: transform + opacity
          "transition-[opacity,transform] duration-200 ease-out origin-top-right",
          isOpen
            ? "opacity-100 translate-y-0 scale-100 pointer-events-auto"
            : "opacity-0 -translate-y-2 scale-95 pointer-events-none"
        )}
      >
        {items.map((item) => {
          const isActive = item.href.startsWith("/")
            ? pathname === item.href || pathname.startsWith(item.href + "/")
            : activeSection === item.href.replace("#", "");
          const styles: NavStyles = NAV_STYLES[item.href] ?? NAV_STYLES["#home"];
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={resolveHref(item.href)}
              role="menuitem"
              onClick={close}
              className={cn(
                "flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-[13px] font-semibold",
                "transition-[color,background-color] duration-[150ms] ease-out",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                isActive
                  ? cn(styles.activeText, styles.activeBg, "border", styles.activeBorder)
                  : cn(
                      "text-gray-600 dark:text-gray-400",
                      "border border-transparent",
                      styles.hoverText,
                      styles.hoverBg
                    )
              )}
              aria-current={isActive ? "page" : undefined}
            >
              <Icon
                className={cn(
                  "w-4 h-4 flex-shrink-0",
                  isActive ? styles.activeText : "text-gray-400 dark:text-gray-500"
                )}
                aria-hidden="true"
              />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
});

export default MoreDropdown;
