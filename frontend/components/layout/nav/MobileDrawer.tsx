"use client";

import React, { memo, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { Youtube, X } from "lucide-react";
import { cn } from "@/lib/utils";
import ThemeToggle from "@/components/ThemeToggle";
import LanguageToggle from "@/components/LanguageToggle";
import PaletteToggle from "@/components/PaletteToggle";
import MemberLoginButton from "./MemberLoginButton";
import { NAV_STYLES } from "./constants";
import { NavItem } from "./types";

interface MobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  navItems: NavItem[];
  activeSection: string;
  pathname: string;
  resolveHref: (href: string) => string;
}

/**
 * MobileDrawer — Full-height slide-in drawer for <sm (below 541px)
 *
 * Features:
 * - 250ms translateX slide-in (GPU only)
 * - Backdrop overlay with click-to-close
 * - Focus trap: Tab cycles within drawer
 * - Escape key closes
 * - Body scroll lock when open
 * - aria-modal="true" for screen readers
 */
const MobileDrawer = memo(function MobileDrawer({
  isOpen,
  onClose,
  navItems,
  activeSection,
  pathname,
  resolveHref,
}: MobileDrawerProps) {
  const drawerRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  // ── Focus trap ─────────────────────────────────────────────────────────────
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === "Escape") {
        onClose();
        return;
      }

      if (e.key !== "Tab") return;

      const drawer = drawerRef.current;
      if (!drawer) return;

      const focusable = drawer.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
      );
      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last?.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first?.focus();
        }
      }
    },
    [isOpen, onClose]
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  // ── Body scroll lock ────────────────────────────────────────────────────────
  useEffect(() => {
    if (isOpen) {
      const scrollY = window.scrollY;
      document.body.style.overflow = "hidden";
      document.body.style.position = "fixed";
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = "100%";
      // Focus close button when drawer opens
      setTimeout(() => closeButtonRef.current?.focus(), 50);
      return () => {
        document.body.style.overflow = "";
        document.body.style.position = "";
        document.body.style.top = "";
        document.body.style.width = "";
        window.scrollTo(0, scrollY);
      };
    }
  }, [isOpen]);

  const socialLinks = [
    {
      icon: Youtube,
      href: "https://youtube.com/@kcmchurchshapur7107?si=NbnoJjdl5lqt7fkO",
      label: "YouTube",
      bg: "bg-[#FF0000]",
    },
  ];

  return (
    <>
      {/* ── Backdrop overlay ── */}
      <div
        onClick={onClose}
        aria-hidden="true"
        className={cn(
          "sm:hidden fixed inset-0 z-40",
          "bg-black/50 backdrop-blur-[2px]",
          // GPU: opacity transition
          "transition-opacity duration-250 ease-out",
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}
      />

      {/* ── Drawer panel ── */}
      <div
        ref={drawerRef}
        id="mobile-drawer"
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
        className={cn(
          "sm:hidden fixed top-0 right-0 bottom-0 z-50",
          "w-[min(320px,100vw)]",
          // Glass card
          "bg-white/98 dark:bg-gray-950/98 backdrop-blur-2xl",
          "border-l border-gray-200/60 dark:border-white/10",
          "shadow-2xl shadow-black/20 dark:shadow-black/50",
          // GPU: translateX transition
          "transition-transform duration-250 ease-out will-change-transform",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        {/* ── Drawer inner scroll container ── */}
        <div className="flex flex-col h-full overflow-y-auto overscroll-contain">

          {/* ── Header row ── */}
          <div className="flex items-center justify-between px-4 py-4 border-b border-gray-100 dark:border-white/5 flex-shrink-0">
            <span className="text-sm font-black text-gray-900 dark:text-white tracking-tight">
              Navigation
            </span>
            <button
              ref={closeButtonRef}
              type="button"
              onClick={onClose}
              aria-label="Close navigation menu"
              className={cn(
                "w-9 h-9 flex items-center justify-center rounded-xl",
                "bg-gray-100/80 dark:bg-white/5",
                "border border-gray-200 dark:border-white/10",
                "text-gray-600 dark:text-gray-300",
                "hover:bg-gray-200 dark:hover:bg-white/10",
                "transition-colors duration-150",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              )}
            >
              <X className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>

          {/* ── Nav links ── */}
          <nav aria-label="Mobile navigation" className="flex-1 px-3 py-3">
            <ul className="space-y-0.5" role="list">
              {navItems.map((item) => {
                const isActive = item.href.startsWith("/")
                  ? pathname === item.href || pathname.startsWith(item.href + "/")
                  : activeSection === item.href.replace("#", "");
                const styles = NAV_STYLES[item.href] ?? NAV_STYLES["#home"];
                const Icon = item.icon;

                return (
                  <li key={item.href} role="listitem">
                    <Link
                      href={resolveHref(item.href)}
                      onClick={onClose}
                      aria-current={isActive ? "page" : undefined}
                      className={cn(
                        // Base
                        "flex items-center gap-3 px-4 py-3.5 rounded-xl",
                        "text-[14px] font-semibold",
                        // Border-left accent
                        "border-l-[3px]",
                        "transition-[color,background-color,border-color] duration-150 ease-out",
                        // Min 44px touch target
                        "min-h-[44px]",
                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                        isActive
                          ? cn(
                              styles.activeBg,
                              styles.activeText,
                              styles.mobileActiveBorder
                            )
                          : cn(
                              "text-gray-600 dark:text-gray-400",
                              "border-l-transparent",
                              "hover:bg-gray-50 dark:hover:bg-white/5",
                              styles.hoverText,
                              styles.hoverBg
                            )
                      )}
                    >
                      <Icon
                        className={cn(
                          "w-4 h-4 flex-shrink-0",
                          isActive
                            ? styles.activeText
                            : "text-gray-400 dark:text-gray-500"
                        )}
                        aria-hidden="true"
                      />
                      <span>{item.name}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* ── Divider ── */}
          <div className="mx-4 h-px bg-gray-100 dark:bg-white/5" />

          {/* ── Preferences section ── */}
          <div className="px-4 py-4 space-y-4 flex-shrink-0">
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500">
              Preferences
            </p>

            {/* Language + Theme + Palette row */}
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">Appearance</span>
              <div className="flex items-center gap-1.5">
                <LanguageToggle />
                <ThemeToggle />
                <PaletteToggle />
              </div>
            </div>

            {/* Social links */}
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500">
                Follow
              </span>
              {socialLinks.map(({ icon: Icon, href, label, bg }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className={cn(
                    "w-9 h-9 rounded-xl text-white flex items-center justify-center",
                    "shadow-sm transition-transform duration-150 hover:scale-110 active:scale-95",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                    bg
                  )}
                >
                  <Icon className="w-3.5 h-3.5" aria-hidden="true" />
                </a>
              ))}
            </div>
          </div>

          {/* ── Login CTA ── */}
          <div className="px-4 pb-6 flex-shrink-0">
            <MemberLoginButton variant="drawer" onClick={onClose} />
          </div>
        </div>
      </div>
    </>
  );
});

export default MobileDrawer;
