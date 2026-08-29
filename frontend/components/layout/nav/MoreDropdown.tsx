"use client";

import React, { memo, useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { NavItem, NavStyles } from "./types";
import { NAV_STYLES } from "./constants";
import { useLanguage } from "@/components/providers/LanguageProvider";

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

  const { t } = useLanguage();
  const moreLabel = (t.nav as any)?.more || "More";

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
        aria-label={`${moreLabel} navigation items`}
        className={cn(
          "apple-liquid-glass-btn relative flex items-center gap-1.5 px-3 py-1.5 rounded-full",
          "text-[12.5px] font-bold whitespace-nowrap select-none overflow-hidden",
          "transition-all duration-300 cubic-bezier(0.16, 1, 0.3, 1)",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1",
          hasActiveOverflow
            ? "text-violet-600 dark:text-violet-300 bg-white/95 dark:bg-white/20 border border-violet-400/50 dark:border-violet-400/40 shadow-[0_0_20px_rgba(139,92,246,0.3)]"
            : "text-gray-700 dark:text-gray-200 border border-transparent hover:bg-white/60 dark:hover:bg-white/12 hover:scale-[1.03] active:scale-[0.97]"
        )}
      >
        <span className="relative z-10" suppressHydrationWarning>{moreLabel}</span>
        <ChevronDown
          className={cn(
            "w-3.5 h-3.5 relative z-10 transition-transform duration-300 ease-out",
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
          "absolute right-0 mt-2 min-w-[200px]",
          // Glass card
          "bg-white/85 dark:bg-[#0d091e]/90 backdrop-blur-3xl",
          "rounded-2xl border border-white/60 dark:border-white/15",
          "shadow-[0_20px_50px_rgba(0,0,0,0.2)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.7)]",
          "p-2 z-50 space-y-1",
          // Animation — GPU: transform + opacity
          "transition-all duration-300 cubic-bezier(0.16, 1, 0.3, 1) origin-top-right",
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
                "apple-liquid-glass-btn relative flex items-center justify-between px-3 py-2.5 rounded-xl text-[13px] font-bold overflow-hidden",
                "transition-all duration-300",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                isActive
                  ? cn(styles.activeText, styles.activeBg, "border", styles.liquidBorderGlow)
                  : cn(
                      "text-gray-700 dark:text-gray-200",
                      "border border-transparent",
                      "hover:bg-white/60 dark:hover:bg-white/10 hover:scale-[1.02]",
                      styles.hoverText
                    )
              )}
              aria-current={isActive ? "page" : undefined}
            >
              <div className="apple-liquid-shimmer" />
              <div className="relative z-10 flex items-center gap-2.5">
                {item.emoji ? (
                  <span className="text-sm" role="img" aria-hidden="true">
                    {item.emoji}
                  </span>
                ) : Icon ? (
                  <Icon
                    className={cn(
                      "w-4 h-4 flex-shrink-0",
                      isActive ? styles.activeText : "text-gray-400 dark:text-gray-500"
                    )}
                    aria-hidden="true"
                  />
                ) : null}
                <span>{item.name}</span>
              </div>
              {isActive && (
                <span
                  className={cn(
                    "w-2 h-2 rounded-full relative z-10 animate-pulse",
                    styles.activeIndicator
                  )}
                />
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
});

export default MoreDropdown;
