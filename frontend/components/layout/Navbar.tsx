"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, Phone, ChevronRight, Youtube, Home, Info, HeartHandshake, Church, Calendar, Mic, Image as ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import ThemeToggle from "@/components/ThemeToggle";
import LanguageToggle from "@/components/LanguageToggle";
import PaletteToggle from "@/components/PaletteToggle";
import BranchSelector from "@/components/BranchSelector";
import { useLanguage } from "@/components/providers/LanguageProvider";


const navStyles: Record<string, {
  activeText: string;
  activeBg: string;
  activeBorder: string;
  hoverText: string;
  hoverBg: string;
  mobileActiveBorder: string;
}> = {
  "#home": {
    activeText: "text-violet-600 dark:text-violet-400",
    activeBg: "bg-violet-50/80 dark:bg-violet-500/10",
    activeBorder: "border-violet-200/60 dark:border-violet-500/20",
    hoverText: "hover:text-violet-600 dark:hover:text-violet-400",
    hoverBg: "hover:bg-violet-50/50 dark:hover:bg-violet-500/5",
    mobileActiveBorder: "border-l-violet-500",
  },
  "#about": {
    activeText: "text-blue-600 dark:text-blue-400",
    activeBg: "bg-blue-50/80 dark:bg-blue-500/10",
    activeBorder: "border-blue-200/60 dark:border-blue-500/20",
    hoverText: "hover:text-blue-600 dark:hover:text-blue-400",
    hoverBg: "hover:bg-blue-50/50 dark:hover:bg-blue-500/5",
    mobileActiveBorder: "border-l-blue-500",
  },
  "/ngo": {
    activeText: "text-emerald-600 dark:text-emerald-400",
    activeBg: "bg-emerald-50/80 dark:bg-emerald-500/10",
    activeBorder: "border-emerald-200/60 dark:border-emerald-500/20",
    hoverText: "hover:text-emerald-600 dark:hover:text-emerald-400",
    hoverBg: "hover:bg-emerald-50/50 dark:hover:bg-emerald-500/5",
    mobileActiveBorder: "border-l-emerald-500",
  },
  "#services": {
    activeText: "text-rose-600 dark:text-rose-400",
    activeBg: "bg-rose-50/80 dark:bg-rose-500/10",
    activeBorder: "border-rose-200/60 dark:border-rose-500/20",
    hoverText: "hover:text-rose-600 dark:hover:text-rose-400",
    hoverBg: "hover:bg-rose-50/50 dark:hover:bg-rose-500/5",
    mobileActiveBorder: "border-l-rose-500",
  },
  "#events": {
    activeText: "text-amber-600 dark:text-amber-400",
    activeBg: "bg-amber-50/80 dark:bg-amber-500/10",
    activeBorder: "border-amber-200/60 dark:border-amber-500/20",
    hoverText: "hover:text-amber-600 dark:hover:text-amber-400",
    hoverBg: "hover:bg-amber-50/50 dark:hover:bg-amber-500/5",
    mobileActiveBorder: "border-l-amber-500",
  },
  "#sermons": {
    activeText: "text-red-600 dark:text-red-400",
    activeBg: "bg-red-50/80 dark:bg-red-500/10",
    activeBorder: "border-red-200/60 dark:border-red-500/20",
    hoverText: "hover:text-red-600 dark:hover:text-red-400",
    hoverBg: "hover:bg-red-50/50 dark:hover:bg-red-500/5",
    mobileActiveBorder: "border-l-red-500",
  },
  "/gallery": {
    activeText: "text-sky-600 dark:text-sky-400",
    activeBg: "bg-sky-50/80 dark:bg-sky-500/10",
    activeBorder: "border-sky-200/60 dark:border-sky-500/20",
    hoverText: "hover:text-sky-600 dark:hover:text-sky-400",
    hoverBg: "hover:bg-sky-50/50 dark:hover:bg-sky-500/5",
    mobileActiveBorder: "border-l-sky-500",
  },
};

export default function Navbar() {
  const { t, language } = useLanguage();
  const pathname = usePathname() || "/";
  const isHomePage = pathname === "/";
  const [isScrolled, setIsScrolled]       = useState(false);
  const [isMobileMenuOpen, setMobileMenu] = useState(false);
  const [activeSection, setActiveSection] = useState("home");

  const resolveHref = (href: string) =>
    href.startsWith("/") ? href : isHomePage ? href : `/${href}`;

  const navItems = [
    { name: t.nav.home,       href: "#home",       icon: Home },
    { name: t.nav.about,      href: "#about",      icon: Info },
    { name: t.nav.ngo,        href: "/ngo",        icon: HeartHandshake },
    { name: t.nav.ministries, href: "#services",   icon: Church },
    { name: t.nav.events,     href: "#events",     icon: Calendar },
    { name: t.nav.sermons,    href: "#sermons",    icon: Mic },
    { name: t.nav.gallery,    href: "/gallery",    icon: ImageIcon },
  ];

  const socialLinks = [
    { icon: Youtube,   href: "https://youtube.com/@kcmchurchshapur7107?si=NbnoJjdl5lqt7fkO", label: "YouTube", color: "hover:text-[#FF0000]", bg: "bg-[#FF0000]" },
  ];

  useEffect(() => {
    let rafId: number;
    const onScroll = () => {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        setIsScrolled(window.scrollY > 50);
        const ids = navItems.filter(i => i.href.startsWith("#")).map(i => i.href.slice(1));
        const cur = ids.find(id => {
          const el = document.getElementById(id);
          if (!el) return false;
          const { top, bottom } = el.getBoundingClientRect();
          return top <= 100 && bottom >= 100;
        });
        if (cur) setActiveSection(cur);
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => { window.removeEventListener("scroll", onScroll); cancelAnimationFrame(rafId); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 w-full flex flex-col pt-[env(safe-area-inset-top)]">
      {/* Skip to Content Link for A11y */}
      <a 
        href="#main-content" 
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-violet-600 focus:text-white focus:rounded-xl focus:font-bold focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500 transition-all duration-200"
      >
        Skip to main content
      </a>

      {/* ── Top info bar (hidden on mobile, collapses on desktop scroll) ── */}
      <div className={cn(
        "hidden xl:block relative bg-gradient-to-r from-violet-700/90 via-purple-700/90 to-violet-700/90 text-purple-100 text-xs overflow-hidden transition-all duration-355 ease-in-out transform-gpu",
        isScrolled ? "max-h-0 opacity-0 pointer-events-none" : "max-h-9 opacity-100"
      )}>
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer pointer-events-none" />
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="flex items-center justify-between h-9">
            <div className="flex items-center gap-3">
              <a href="tel:+919704090069" className="flex items-center gap-1.5 hover:text-white transition-colors group focus-visible:ring-2 focus-visible:ring-white rounded-md px-1">
                <Phone className="w-3 h-3" />
                <span className="font-medium">+91 97040 90069 (Senior Pastor)</span>
              </a>
              <span className="text-purple-400/50">|</span>
              <a href="tel:+919640943777" className="flex items-center gap-1.5 hover:text-white transition-colors group focus-visible:ring-2 focus-visible:ring-white rounded-md px-1">
                <Phone className="w-3 h-3" />
                <span className="font-medium">+91 96409 43777</span>
              </a>
              <span className="text-purple-400/50">|</span>
              <a href="tel:+917396433856" className="flex items-center gap-1.5 hover:text-white transition-colors group focus-visible:ring-2 focus-visible:ring-white rounded-md px-1">
                <Phone className="w-3 h-3" />
                <span className="font-medium">+91 73964 33856</span>
              </a>
            </div>
            <div className="flex items-center gap-2 text-purple-200/80">
              <ChevronRight className="w-3 h-3" />
              <span className="tracking-wide">Sunday Services: 5:45 AM | 8:30 AM | 10:30 AM</span>
              <ChevronRight className="w-3 h-3" />
            </div>
            <div className="flex items-center gap-1">
              <span className="mr-1.5 text-purple-300/70 text-[10px] uppercase tracking-wider">Follow</span>
              {socialLinks.map(({ icon: Icon, href, label, color }) => (
                <a key={label} href={href} target="_blank" rel="noopener noreferrer" aria-label={label}
                  className={cn("w-6 h-6 flex items-center justify-center rounded-md hover:bg-white/15 transition-all focus-visible:ring-2 focus-visible:ring-white", color)}>
                  <Icon className="w-3 h-3" />
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Main Navbar ── */}
      <nav 
        aria-label="Main navigation"
        className={cn(
          "transition-all duration-250 ease-in-out transform-gpu border-b w-full",
          isScrolled
            ? "bg-white/95 dark:bg-gray-950/95 backdrop-blur-2xl shadow-md border-gray-200/80 dark:border-white/10 py-2"
            : "bg-white/80 dark:bg-gray-950/85 backdrop-blur-xl border-transparent py-3"
        )}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-4">

            {/* ── Logo ── */}
            <a href="/" className="flex items-center gap-1.5 sm:gap-3 group flex-shrink-0 min-w-0 focus-visible:ring-2 focus-visible:ring-primary rounded-xl p-1">
              {/* Logo circle */}
              <div className="relative w-8 h-8 sm:w-11 md:w-13 flex-shrink-0">
                <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-violet-500 via-purple-500 to-violet-600 opacity-0 group-hover:opacity-100 blur-md transition-opacity duration-500 scale-125" />
                <div className="relative w-8 h-8 sm:w-11 md:w-13 rounded-full overflow-hidden border-2 border-purple-300/40 group-hover:border-purple-400/70 shadow-lg transition-all duration-300 bg-white flex items-center justify-center">
                  <Image src="/logo.png" alt="KCM Logo" fill className="object-contain p-0.5" priority />
                </div>
              </div>

              {/* Name */}
              <div className="flex flex-col min-w-0">
                <span
                  suppressHydrationWarning
                  className={cn(
                    "font-black leading-tight text-gray-900 dark:text-white whitespace-nowrap",
                    "text-[10px] min-[360px]:text-[11px] min-[390px]:text-xs sm:text-base md:text-lg",
                    language !== "en" ? "tracking-normal" : "tracking-tight"
                  )}
                >
                  {t.nav.churchName}
                </span>
                <span
                  suppressHydrationWarning
                  className={cn(
                    "leading-none whitespace-nowrap",
                    language !== "en"
                      ? "text-[9px] min-[360px]:text-[10px] font-extrabold text-purple-600 dark:text-purple-400 tracking-normal"
                      : "text-[0.45rem] min-[360px]:text-[0.5rem] sm:text-[0.6rem] font-bold uppercase tracking-[0.2em] bg-gradient-to-r from-purple-600 to-violet-500 bg-clip-text text-transparent"
                  )}
                >
                  {t.nav.ministries}
                </span>
              </div>
            </a>

            {/* ── Desktop & Tablet Nav Links (visible at width >= 541px) ── */}
            <div className="hidden min-[541px]:flex items-center gap-0.5 min-[640px]:gap-1 md:gap-1.5 lg:gap-2 flex-1 justify-center">
              {navItems.map((item) => {
                const isActive = item.href.startsWith("/")
                  ? pathname === item.href
                  : activeSection === item.href.replace("#", "");
                const styles = navStyles[item.href] || navStyles["#home"];
                const Icon = item.icon;

                return (
                  <Link
                    key={item.href}
                    href={resolveHref(item.href)}
                    className={cn(
                      "relative px-1.5 py-1 min-[640px]:px-3.5 min-[640px]:py-1.5 text-[10px] min-[640px]:text-xs lg:text-sm font-semibold rounded-xl transition-all duration-300 whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                      isActive
                        ? styles.activeText
                        : cn("text-gray-600 dark:text-gray-400 dark:hover:text-white hover:bg-gray-100/60 dark:hover:bg-white/5", styles.hoverText, styles.hoverBg)
                    )}
                  >
                    {isActive && (
                      <span className={cn("absolute inset-0 rounded-xl border backdrop-blur-md shadow-sm transition-all duration-300 animate-scale-in", styles.activeBg, styles.activeBorder)} />
                    )}
                    <span className="relative z-10 flex items-center gap-1.5">
                      <Icon className="w-3.5 h-3.5" />
                      <span>{item.name}</span>
                    </span>
                  </Link>
                );
              })}
            </div>

            {/* ── Right Controls ── */}
            <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
              {/* BranchSelector — visible on all viewports */}
              <div>
                <BranchSelector />
              </div>
              
              {/* Combined Settings/Preferences Dropdown (lg+) */}
              <div className="hidden lg:block">
                <PaletteToggle showPreferences={true} />
              </div>

              {/* Member Login — Tablet/Desktop (visible at width >= 541px) */}
              <Link
                href="/login"
                className="hidden min-[541px]:flex items-center relative px-2.5 py-1.5 min-[640px]:px-4 min-[640px]:py-2 rounded-xl font-bold text-white text-[10px] min-[640px]:text-xs lg:text-sm overflow-hidden group shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105 active:scale-95 whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                <span className="absolute inset-0 bg-gradient-to-r from-violet-600 to-purple-600 group-hover:from-violet-500 group-hover:to-purple-500 transition-all duration-300" />
                <span className="relative z-10">{t.nav.login}</span>
              </Link>

              {/* ── Hamburger Menu Button (mobile only, width < 541px) ── */}
              <button
                onClick={() => setMobileMenu(!isMobileMenuOpen)}
                aria-label="Toggle menu"
                aria-expanded={isMobileMenuOpen}
                aria-controls="mobile-menu"
                className="min-[541px]:hidden flex items-center justify-center p-2 rounded-xl bg-gray-100/80 dark:bg-white/10 border border-gray-200 dark:border-white/20 text-gray-800 dark:text-white hover:bg-gray-200 dark:hover:bg-white/20 transition-all min-w-[44px] min-h-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </div>

          {/* ── Mobile Dropdown Menu (width < 541px) ── */}
          {isMobileMenuOpen && (
            <div 
              id="mobile-menu"
              className="min-[541px]:hidden mt-3 mb-1 p-4 bg-white dark:bg-gray-950 rounded-2xl shadow-2xl border border-gray-200 dark:border-white/10 animate-scale-in"
            >
              {/* Nav links */}
              <nav className="space-y-1">
                {navItems.map((item) => {
                  const isActive = item.href.startsWith("/")
                    ? pathname === item.href
                    : activeSection === item.href.replace("#", "");
                  const styles = navStyles[item.href] || navStyles["#home"];
                  const Icon = item.icon;

                  return (
                    <Link
                      key={item.href}
                      href={resolveHref(item.href)}
                      onClick={() => setMobileMenu(false)}
                      className={cn(
                        "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all border-l-[3px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                        isActive
                          ? cn(styles.activeBg, styles.activeText, styles.mobileActiveBorder)
                          : cn("text-gray-600 hover:text-gray-900 hover:bg-gray-50 dark:text-gray-400 dark:hover:text-white dark:hover:bg-white/5 border-l-transparent", styles.hoverBg, styles.hoverText)
                      )}
                    >
                      <Icon className={cn("w-4 h-4 flex-shrink-0 transition-colors", isActive ? styles.activeText : "text-gray-450 dark:text-gray-400")} />
                      <span>{item.name}</span>
                    </Link>
                  );
                })}
              </nav>

              <div className="mt-4 pt-4 border-t border-gray-200/70 dark:border-white/10 space-y-3">
                {/* Toggles row */}
                <div className="flex items-center justify-between px-1">
                  <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Preferences</span>
                  <div className="flex items-center gap-1.5">
                    <LanguageToggle />
                    <ThemeToggle />
                    <PaletteToggle />
                  </div>
                </div>

                {/* Social */}
                <div className="flex items-center gap-2 px-1">
                  <span className="text-xs text-gray-400 uppercase tracking-wider font-semibold mr-1">Follow</span>
                  {socialLinks.map(({ icon: Icon, href, label, bg }) => (
                    <a key={label} href={href} target="_blank" rel="noopener noreferrer" aria-label={label}
                      className={cn("w-9 h-9 rounded-full text-white flex items-center justify-center shadow-sm transition-all hover:scale-110 focus-visible:ring-2 focus-visible:ring-primary", bg)}>
                      <Icon className="w-3.5 h-3.5" />
                    </a>
                  ))}
                </div>

                {/* Login CTA */}
                <Link
                  href="/login"
                  onClick={() => setMobileMenu(false)}
                  className="block w-full py-3 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-xl font-bold text-center shadow-lg hover:shadow-purple-500/30 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                >
                  {t.nav.login}
                </Link>
              </div>
            </div>
          )}
        </div>
      </nav>
    </header>
  );
}
