"use client";

import React, { useState, useEffect, useRef, useCallback, useMemo, memo, startTransition } from "react";
import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import {
  Home, Info, HeartHandshake, Church, Calendar, Mic, Image as ImageIcon, Phone, Menu, X, Sun, Moon,
} from "lucide-react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/components/providers/LanguageProvider";
import TopInfoBar from "./TopInfoBar";
import NavigationLogo from "./NavigationLogo";
import DesktopMenu from "./DesktopMenu";
import TabletMenu from "./TabletMenu";
import NavigationActions from "./NavigationActions";
import { NavItem } from "./types";

const MobileDrawer = dynamic(() => import("./MobileDrawer"), { ssr: false });

/**
 * NavigationBar — Root navigation shell
 *
 * Responsibilities:
 *   • Sticky positioning: position:sticky top:0 z-[1000]
 *   • Scroll-aware state → backdrop-blur, shadow, hairline border
 *   • Dynamic --kcm-header-height CSS variable measurement via ResizeObserver
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
  const headerRef = useRef<HTMLElement>(null);

  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileOpen, setMobileOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("home");

  const { theme, resolvedTheme, setTheme } = useTheme();
  const currentTheme = resolvedTheme || theme || "light";

  const toggleTheme = useCallback((e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    const nextTheme = currentTheme === "dark" ? "light" : "dark";

    // Non-blocking DOM class update in requestAnimationFrame so the click handler returns in <1ms
    requestAnimationFrame(() => {
      if (nextTheme === "dark") {
        document.documentElement.classList.add("dark");
        document.documentElement.classList.remove("light");
      } else {
        document.documentElement.classList.remove("dark");
        document.documentElement.classList.add("light");
      }
    });

    // Wrap theme state update in transition to allow instant paint (<16ms INP)
    startTransition(() => {
      setTheme(nextTheme);
    });
  }, [currentTheme, setTheme]);

  // ── Dynamic header height measurement for sticky secondary navigation stacking ──
  useEffect(() => {
    const el = headerRef.current;
    if (!el) return;

    const updateHeaderHeight = () => {
      const height = el.getBoundingClientRect().height || el.offsetHeight;
      if (height > 0) {
        document.documentElement.style.setProperty("--kcm-header-height", `${Math.round(height)}px`);
      }
    };

    updateHeaderHeight();

    let ro: ResizeObserver | null = null;
    if (typeof ResizeObserver !== "undefined") {
      ro = new ResizeObserver(() => {
        updateHeaderHeight();
      });
      ro.observe(el);
    }

    window.addEventListener("resize", updateHeaderHeight, { passive: true });

    return () => {
      if (ro) ro.disconnect();
      window.removeEventListener("resize", updateHeaderHeight);
    };
  }, []);

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
      { name: t.nav.contact || "Connect", href: "/contact", icon: Phone, emoji: "📞" },
    ],
    [t.nav]
  );

  // ── Href resolver — hash links become absolute on non-home pages ────────────
  const resolveHref = useCallback(
    (href: string) => (href.startsWith("/") ? href : isHomePage ? href : `/${href}`),
    [isHomePage]
  );

  // ── Scroll & Active Section Detection — Zero-Jank IntersectionObserver ────
  useEffect(() => {
    // 1. Passive, throttled scroll threshold with hysteresis deadband (prevents jitter loops)
    let ticking = false;
    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const sy = window.scrollY;
          setIsScrolled((prev) => {
            if (!prev && sy > 50) return true;
            if (prev && sy < 15) return false;
            return prev;
          });
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    setIsScrolled(window.scrollY > 50);

    // 2. High-performance IntersectionObserver for active section highlighting
    const hashSections = navItems
      .filter((i) => i.href.startsWith("#"))
      .map((i) => i.href.slice(1));

    const observerOptions = {
      root: null,
      rootMargin: "-20% 0px -70% 0px",
      threshold: 0,
    };

    const sectionObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveSection(entry.target.id);
        }
      });
    }, observerOptions);

    hashSections.forEach((id) => {
      const el = document.getElementById(id);
      if (el) sectionObserver.observe(el);
    });

    return () => {
      window.removeEventListener("scroll", onScroll);
      sectionObserver.disconnect();
    };
  }, [navItems]);

  // ── Global Escape key → closes drawer ──────────────────────────────────────
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isMobileOpen) setMobileOpen(false);
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [isMobileOpen]);

  // ── Lock body scroll & hide chat when mobile drawer is open ──────────────────
  useEffect(() => {
    if (isMobileOpen) {
      document.body.style.overflow = "hidden";
      document.documentElement.setAttribute("data-mobile-menu-open", "true");
    } else {
      document.body.style.overflow = "";
      document.documentElement.removeAttribute("data-mobile-menu-open");
    }
    window.dispatchEvent(new CustomEvent("mobile-menu-toggle", { detail: { isOpen: isMobileOpen } }));

    return () => {
      document.body.style.overflow = "";
      document.documentElement.removeAttribute("data-mobile-menu-open");
    };
  }, [isMobileOpen]);

  // ── Close drawer on route change ────────────────────────────────────────────
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  return (
    <>
      {/* ── Top info bar (in natural page flow above sticky header) ── */}
      <TopInfoBar />

      <header
        ref={headerRef}
        className={cn(
          "sticky top-0 z-[1000] w-full",
          "flex flex-col",
          // Safe area for iOS notch and screen edge insets
          "pt-[env(safe-area-inset-top)] pl-[env(safe-area-inset-left)] pr-[env(safe-area-inset-right)]",
          // Prevent CLS — stable width
          "max-w-[100vw]",
          // Frosted glass background when scrolled to prevent page content bleeding through
          isScrolled
            ? "bg-white/85 dark:bg-slate-950/85 backdrop-blur-xl border-b border-slate-200/50 dark:border-white/5 transition-[background-color,border-color,box-shadow] duration-200"
            : "bg-transparent transition-[background-color] duration-200"
        )}
      >
        {/* ── Floating Capsule Navbar ── */}
        <nav
          aria-label="Main navigation"
          className="w-full px-2.5 py-2 min-[360px]:px-3.5 sm:px-6 lg:px-8 2xl:px-12 transition-all duration-200"
        >
          {/* ── Floating Island Glassmorphism Pill Container ── */}
          <div
            className={cn(
              "mx-auto w-full max-w-screen-xl 2xl:max-w-[1440px]",
              "rounded-full transition-all duration-300",
              // Floating island glassmorphism styling
              "bg-white/95 dark:bg-slate-900/90 backdrop-blur-2xl",
              "border border-slate-200/80 dark:border-white/10",
              isScrolled
                ? "shadow-xl shadow-black/10 dark:shadow-purple-950/40 border-purple-300/60 dark:border-violet-500/30"
                : "shadow-md shadow-black/[0.04] dark:shadow-purple-950/20",
              "px-3.5 min-[360px]:px-4 sm:px-5 md:px-6 lg:px-7 xl:px-8 py-1.5 min-[360px]:py-2"
            )}
          >
            {/* ── Flex row: Logo | Menu | Actions with guaranteed breathing room ── */}
            <div
              className={cn(
                "flex items-center justify-between",
                "gap-2 md:gap-3 lg:gap-4 xl:gap-6",
                "min-h-[44px] min-[360px]:min-h-[48px] sm:min-h-[52px]"
              )}
            >
              {/* Logo */}
              <NavigationLogo />

              {/* ── Tablet Nav (md–xl: 768px–1279px Laptops & Tablets) ── */}
              <TabletMenu
                navItems={navItems}
                activeSection={activeSection}
                pathname={pathname}
                resolveHref={resolveHref}
              />

              {/* ── Primary Desktop Nav (xl+: ≥1280px Desktop & Widescreen) ── */}
              <DesktopMenu
                navItems={navItems}
                activeSection={activeSection}
                pathname={pathname}
                resolveHref={resolveHref}
              />

              {/* ── Right actions: BranchSelector + Login + Squircle Theme Toggle + Squircle Hamburger ── */}
              <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0 shrink-0">
                {/* Branch Selector + Login */}
                <NavigationActions showSettings={false} />

                {/* ── 1-Tap Concentric Theme Toggle (Moon / Sun from reference design) ── */}
                <button
                  type="button"
                  onClick={toggleTheme}
                  aria-label={currentTheme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
                  title={currentTheme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
                  className={cn(
                    "w-8 h-8 sm:w-[34px] sm:h-[34px] rounded-full flex-shrink-0 shrink-0",
                    "flex items-center justify-center",
                    "bg-slate-100/90 hover:bg-slate-200/90 dark:bg-white/10 dark:hover:bg-white/15",
                    "border border-slate-200/70 dark:border-white/10",
                    "text-purple-600 dark:text-purple-400",
                    "transition-transform duration-100 ease-out",
                    "active:scale-95 cursor-pointer touch-manipulation",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500"
                  )}
                >
                  {currentTheme === "dark" ? (
                    <Sun className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400 fill-amber-400/20" />
                  ) : (
                    <Moon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-purple-600" />
                  )}
                </button>

                {/* ── Squircle Hamburger Button (3 lines from reference design) ── */}
                <button
                  type="button"
                  onClick={() => setMobileOpen(!isMobileOpen)}
                  aria-label={isMobileOpen ? "Close navigation menu" : "Open navigation menu"}
                  aria-expanded={isMobileOpen}
                  aria-controls="mobile-drawer"
                  className={cn(
                    "md:hidden flex-shrink-0",
                    "flex items-center justify-center",
                    "w-9 h-9 min-[360px]:w-10 min-[360px]:h-10 rounded-2xl",
                    "bg-slate-100/90 hover:bg-slate-200/90 dark:bg-white/10 dark:hover:bg-white/15",
                    "border border-slate-200/70 dark:border-white/10",
                    "text-slate-700 dark:text-slate-200",
                    "transition-all duration-150 ease-out",
                    "active:scale-95 cursor-pointer touch-manipulation",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500"
                  )}
                >
                  {isMobileOpen ? (
                    <X className="w-4.5 h-4.5 min-[360px]:w-5 min-[360px]:h-5 stroke-[2.25]" aria-hidden="true" />
                  ) : (
                    <Menu className="w-4.5 h-4.5 min-[360px]:w-5 min-[360px]:h-5 stroke-[2.25]" aria-hidden="true" />
                  )}
                </button>
              </div>
            </div>

            {/* ── Mobile Drawer — lazy-loaded on demand when menu is opened ── */}
            {isMobileOpen && (
              <MobileDrawer
                isOpen={isMobileOpen}
                onClose={() => setMobileOpen(false)}
                navItems={navItems}
                activeSection={activeSection}
                pathname={pathname}
                resolveHref={resolveHref}
              />
            )}
          </div>
        </nav>
      </header>
    </>
  );
});

export default NavigationBar;
