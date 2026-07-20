"use client";

import React, { useState, useEffect, useCallback, useMemo, memo } from "react";
import { usePathname } from "next/navigation";
import {
  Home, Info, HeartHandshake, Church, Calendar, Mic, Image as ImageIcon, Menu, X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/components/providers/LanguageProvider";
import TopInfoBar from "./TopInfoBar";
import NavigationLogo from "./NavigationLogo";
import DesktopMenu from "./DesktopMenu";
import TabletMenu from "./TabletMenu";
import NavigationActions from "./NavigationActions";
import MobileDrawer from "./MobileDrawer";
import { NavItem } from "./types";

/**
 * NavigationBar — Root navigation shell
 *
 * Responsibilities:
 *   • Sticky positioning: position:sticky top:0 z-50
 *   • Scroll-aware state → backdrop-blur, shadow, hairline border
 *   • Active section detection via IntersectionObserver / rAF scroll
 *   • Mobile drawer open/close + Escape key
 *   • Orchestrates all child components
 *
 * Heights by breakpoint (set via CSS min-height):
 *   <375px: 56px | 376–540px: 60px | 541–768px: 64px
 *   769–1024px: 68px | 1025–1440px: 72px | 1441px+: 76px
 */
const NavigationBar = memo(function NavigationBar() {
  const { t } = useLanguage();
  const pathname = usePathname() ?? "/";
  const isHomePage = pathname === "/";

  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileOpen, setMobileOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("home");

  // ── Nav items — memoized, only rebuilds when translations change ────────────
  const navItems: NavItem[] = useMemo(
    () => [
      { name: t.nav.home,       href: "#home",     icon: Home,           emoji: "🏡" },
      { name: t.nav.about,      href: "#about",    icon: Info,           emoji: "ℹ️" },
      { name: t.nav.ngo,        href: "/ngo",      icon: HeartHandshake, emoji: "🤝" },
      { name: t.nav.ministries, href: "#services", icon: Church,         emoji: "⛪" },
      { name: t.nav.events,     href: "#events",   icon: Calendar,       emoji: "🗓️" },
      { name: t.nav.sermons,    href: "#sermons",  icon: Mic,            emoji: "🎙️" },
      { name: t.nav.gallery,    href: "/gallery",  icon: ImageIcon,      emoji: "🖼️" },
    ],
    [t.nav]
  );

  // ── Href resolver — hash links become absolute on non-home pages ────────────
  const resolveHref = useCallback(
    (href: string) => (href.startsWith("/") ? href : isHomePage ? href : `/${href}`),
    [isHomePage]
  );

  // ── Scroll listener — rAF + passive for zero jank ──────────────────────────
  useEffect(() => {
    let rafId: number;
    const hashSections = navItems
      .filter((i) => i.href.startsWith("#"))
      .map((i) => i.href.slice(1));

    const onScroll = () => {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        setIsScrolled(window.scrollY > 40);

        // Active section detection
        const active = hashSections.find((id) => {
          const el = document.getElementById(id);
          if (!el) return false;
          const { top, bottom } = el.getBoundingClientRect();
          return top <= 100 && bottom >= 100;
        });
        if (active) setActiveSection(active);
      });
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(rafId);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Global Escape key → closes drawer ──────────────────────────────────────
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isMobileOpen) setMobileOpen(false);
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [isMobileOpen]);

  // ── Close drawer on route change ────────────────────────────────────────────
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  return (
    <>
      {/* Skip to main content — keyboard only */}
      <a
        href="#main-content"
        className={cn(
          "sr-only focus:not-sr-only",
          "focus:absolute focus:top-4 focus:left-4 focus:z-[200]",
          "focus:px-4 focus:py-2.5 focus:rounded-xl",
          "focus:bg-violet-600 focus:text-white focus:font-bold focus:shadow-xl",
          "focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2",
          "transition-all duration-200"
        )}
      >
        Skip to main content
      </a>

      <header
        className={cn(
          "fixed top-0 left-0 right-0 z-50 w-full",
          "flex flex-col",
          // Safe area for iOS notch
          "pt-[env(safe-area-inset-top)]",
          // Prevent CLS — stable width
          "max-w-[100vw]"
        )}
      >
        {/* ── Top info bar (xl+, collapses on scroll) ── */}
        <TopInfoBar isScrolled={isScrolled} />

        {/* ── Main nav ── */}
        <nav
          aria-label="Main navigation"
          className={cn(
            "w-full",
            // Transition: backdrop, border, shadow — 180ms GPU
            "transition-[background-color,backdrop-filter,border-color,box-shadow] duration-[180ms] ease-out",
            "border-b",
            isScrolled
              ? [
                  "bg-white/95 dark:bg-[#0d0a1e]/98",
                  "backdrop-blur-2xl",
                  "border-gray-200/80 dark:border-violet-500/30",
                  "shadow-[0_1px_20px_0_rgba(0,0,0,0.06)] dark:shadow-[0_4px_32px_0_rgba(109,40,217,0.25)]",
                ].join(" ")
              : [
                  "bg-white/85 dark:bg-[#0d0a1e]/90",
                  "backdrop-blur-xl",
                  "border-transparent dark:border-violet-500/15",
                  "shadow-none dark:shadow-[0_2px_16px_0_rgba(109,40,217,0.12)]",
                ].join(" ")
          )}
        >
          {/* ── Max-width container ── */}
          <div
            className={cn(
              "mx-auto w-full",
              // Max-widths per breakpoint
              "max-w-screen-xl 2xl:max-w-[1440px]",
              // Horizontal padding — spacing scale
              "px-4 sm:px-6 lg:px-8 2xl:px-12"
            )}
          >
            {/* ── Flex row: Logo | Menu | Actions ── */}
            <div
              className={cn(
                "flex items-center justify-between",
                // Gap — spacing scale
                "gap-3 sm:gap-4 lg:gap-6",
                // Heights per breakpoint
                "min-h-[56px] sm:min-h-[64px] md:min-h-[68px] lg:min-h-[72px] 2xl:min-h-[76px]"
              )}
            >
              {/* Logo */}
              <NavigationLogo />

              {/* ── Desktop nav (lg+) ── */}
              <DesktopMenu
                navItems={navItems}
                activeSection={activeSection}
                pathname={pathname}
                resolveHref={resolveHref}
              />

              {/* ── Tablet nav (sm–lg) ── */}
              <TabletMenu
                navItems={navItems}
                activeSection={activeSection}
                pathname={pathname}
                resolveHref={resolveHref}
              />

              {/* ── Right actions: BranchSelector + Settings + Login + Hamburger ── */}
              <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
                {/* Branch Selector + Settings + Login (responsive per NavigationActions) */}
                <NavigationActions />

                {/* Hamburger — mobile only (<sm) */}
                <button
                  type="button"
                  onClick={() => setMobileOpen(!isMobileOpen)}
                  aria-label={isMobileOpen ? "Close navigation menu" : "Open navigation menu"}
                  aria-expanded={isMobileOpen}
                  aria-controls="mobile-drawer"
                  className={cn(
                    "sm:hidden",
                    "flex items-center justify-center",
                    // 44×44 min touch target
                    "w-11 h-11 rounded-xl",
                    "bg-gray-100/80 dark:bg-violet-500/10",
                    "border border-gray-200 dark:border-violet-400/20",
                    "text-gray-700 dark:text-violet-200",
                    "hover:bg-gray-200/80 dark:hover:bg-violet-500/20",
                    "transition-[background-color,color,transform] duration-150 ease-out",
                    "active:scale-90",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  )}
                >
                  {isMobileOpen ? (
                    <X className="w-5 h-5" aria-hidden="true" />
                  ) : (
                    <Menu className="w-5 h-5" aria-hidden="true" />
                  )}
                </button>
              </div>
            </div>

            {/* ── Mobile Drawer — rendered inside nav container to act as a dropdown ── */}
            <MobileDrawer
              isOpen={isMobileOpen}
              onClose={() => setMobileOpen(false)}
              navItems={navItems}
              activeSection={activeSection}
              pathname={pathname}
              resolveHref={resolveHref}
            />
          </div>
        </nav>
      </header>
    </>
  );
});

export default NavigationBar;
