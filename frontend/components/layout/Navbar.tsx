"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, Phone, ChevronRight } from "lucide-react";
import { Instagram, Youtube } from "lucide-react";
import { cn } from "@/lib/utils";
import ThemeToggle from "@/components/ThemeToggle";
import LanguageToggle from "@/components/LanguageToggle";
import PaletteToggle from "@/components/PaletteToggle";
import BranchSelector from "@/components/BranchSelector";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { useAuth } from "@/components/providers/AuthProvider";

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
  const { user } = useAuth();
  const pathname = usePathname() || "/";
  const isHomePage = pathname === "/";
  const [isScrolled, setIsScrolled]       = useState(false);
  const [isMobileMenuOpen, setMobileMenu] = useState(false);
  const [activeSection, setActiveSection] = useState("home");

  const resolveHref = (href: string) =>
    href.startsWith("/") ? href : isHomePage ? href : `/${href}`;

  const navItems = [
    { name: t.nav.home,       href: "#home" },
    { name: t.nav.about,      href: "#about" },
    { name: t.nav.ngo,        href: "/ngo" },
    { name: t.nav.ministries, href: "#services" },
    { name: t.nav.events,     href: "#events" },
    { name: t.nav.sermons,    href: "#sermons" },
    { name: t.nav.gallery,    href: "/gallery" },
  ];

  const socialLinks = [
    { icon: Instagram, href: "https://instagram.com", label: "Instagram",  color: "hover:text-[#E1306C]", bg: "bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888]" },
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
    <div className="fixed top-0 left-0 right-0 z-50 flex flex-col">

      {/* ── Top info bar (hidden on mobile) ── */}
      <div className="hidden xl:block relative bg-gradient-to-r from-violet-700/90 via-purple-700/90 to-violet-700/90 text-purple-100 text-xs overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer pointer-events-none" />
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="flex items-center justify-between h-9">
            <div className="flex items-center gap-3">
              <a href="tel:+919704090069" className="flex items-center gap-1.5 hover:text-white transition-colors group">
                <Phone className="w-3 h-3" />
                <span className="font-medium">+91 97040 90069 (Senior Pastor)</span>
              </a>
              <span className="text-purple-400/50">|</span>
              <a href="tel:+919640943777" className="flex items-center gap-1.5 hover:text-white transition-colors group">
                <Phone className="w-3 h-3" />
                <span className="font-medium">+91 96409 43777</span>
              </a>
              <span className="text-purple-400/50">|</span>
              <a href="tel:+917396433856" className="flex items-center gap-1.5 hover:text-white transition-colors group">
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
                  className={cn("w-6 h-6 flex items-center justify-center rounded-md hover:bg-white/15 transition-all", color)}>
                  <Icon className="w-3 h-3" />
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Main Navbar ── */}
      <nav className={cn(
        "transition-all duration-300 relative border-b",
        isScrolled
          ? "bg-white/90 dark:bg-gray-950/90 backdrop-blur-2xl shadow-sm shadow-purple-900/10 border-gray-200/60 dark:border-white/10 py-2"
          : "bg-white/60 dark:bg-gray-950/60 backdrop-blur-xl border-transparent py-3"
      )}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-4">

            {/* ── Logo ── */}
            <a href="/" className="flex items-center gap-1.5 sm:gap-3 group flex-shrink-0 min-w-0">
              {/* Logo circle */}
              <div className="relative w-9 h-9 sm:w-12 md:w-14 flex-shrink-0">
                <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-violet-500 via-purple-500 to-violet-600 opacity-0 group-hover:opacity-100 blur-md transition-opacity duration-500 scale-125" />
                <div className="relative w-9 h-9 sm:w-12 md:w-14 rounded-full overflow-hidden border-2 border-purple-300/40 group-hover:border-purple-400/70 shadow-lg transition-all duration-300 bg-white flex items-center justify-center">
                  <Image src="/logo.png" alt="KCM Logo" fill className="object-contain p-0.5" priority />
                </div>
              </div>

              {/* Name — whitespace-nowrap prevents wrapping */}
              <div className="flex flex-col min-w-0">
                <span
                  suppressHydrationWarning
                  className={cn(
                    "font-black leading-tight text-gray-900 dark:text-white whitespace-nowrap",
                    "text-xs sm:text-base md:text-lg",
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
                      ? "text-xs font-extrabold text-purple-600 dark:text-purple-400 tracking-normal"
                      : "text-[0.55rem] sm:text-[0.6rem] font-bold uppercase tracking-[0.2em] bg-gradient-to-r from-purple-600 to-violet-500 bg-clip-text text-transparent"
                  )}
                >
                  {t.nav.ministries}
                </span>
              </div>
            </a>

            {/* ── Desktop Nav Links (lg+) ── */}
            <div className="hidden lg:flex items-center gap-1 flex-1 justify-center">
              {navItems.map((item) => {
                const isActive = item.href.startsWith("/")
                  ? pathname === item.href
                  : activeSection === item.href.replace("#", "");
                const styles = navStyles[item.href] || navStyles["#home"];

                return (
                  <Link
                    key={item.href}
                    href={resolveHref(item.href)}
                    className={cn(
                      "relative px-3.5 py-1.5 text-sm font-semibold rounded-xl transition-all duration-300 whitespace-nowrap",
                      isActive
                        ? styles.activeText
                        : cn("text-gray-600 dark:text-gray-400 dark:hover:text-white hover:bg-gray-100/60 dark:hover:bg-white/5", styles.hoverText, styles.hoverBg)
                    )}
                  >
                    {isActive && (
                      <span className={cn("absolute inset-0 rounded-xl border backdrop-blur-md shadow-sm transition-all duration-300 animate-scale-in", styles.activeBg, styles.activeBorder)} />
                    )}
                    <span className="relative z-10">{item.name}</span>
                  </Link>
                );
              })}
            </div>

            {/* ── Right Controls ── */}
            <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
              {/* BranchSelector — visible on mobile and desktop */}
              <div>
                <BranchSelector />
              </div>
              
              {/* Combined Settings/Preferences Dropdown (lg+) */}
              <div className="hidden lg:block">
                <PaletteToggle showPreferences={true} />
              </div>

              {/* Member Login — desktop only (xl+) */}
              <Link
                href="/login"
                className="hidden xl:flex items-center relative px-4 py-2 rounded-xl font-bold text-white text-sm overflow-hidden group shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105 active:scale-95 whitespace-nowrap"
              >
                <span className="absolute inset-0 bg-gradient-to-r from-violet-600 to-purple-600 group-hover:from-violet-500 group-hover:to-purple-500 transition-all duration-300" />
                <span className="relative z-10">Member Login</span>
              </Link>

              {/* ── Hamburger (< lg) ── */}
              <button
                onClick={() => setMobileMenu(!isMobileMenuOpen)}
                aria-label="Toggle menu"
                className="lg:hidden p-2 rounded-xl bg-gray-100/80 dark:bg-white/10 border border-gray-200 dark:border-white/20 text-gray-800 dark:text-white hover:bg-gray-200 dark:hover:bg-white/20 transition-all"
              >
                {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </div>

          {/* ── Mobile Dropdown Menu ── */}
          {isMobileMenuOpen && (
            <div className="lg:hidden mt-3 mb-1 p-4 bg-white dark:bg-gray-950 rounded-2xl shadow-2xl border border-gray-200 dark:border-white/10 animate-scale-in">

              {/* Nav links */}
              <nav className="space-y-1">
                {navItems.map((item) => {
                  const isActive = item.href.startsWith("/")
                    ? pathname === item.href
                    : activeSection === item.href.replace("#", "");
                  const styles = navStyles[item.href] || navStyles["#home"];

                  return (
                    <Link
                      key={item.href}
                      href={resolveHref(item.href)}
                      onClick={() => setMobileMenu(false)}
                      className={cn(
                        "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all border-l-[3px]",
                        isActive
                          ? cn(styles.activeBg, styles.activeText, styles.mobileActiveBorder)
                          : cn("text-gray-600 hover:text-gray-900 hover:bg-gray-50 dark:text-gray-400 dark:hover:text-white dark:hover:bg-white/5 border-l-transparent", styles.hoverBg, styles.hoverText)
                      )}
                    >
                      {item.name}
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
                      className={cn("w-9 h-9 rounded-full text-white flex items-center justify-center shadow-sm transition-all hover:scale-110", bg)}>
                      <Icon className="w-3.5 h-3.5" />
                    </a>
                  ))}
                </div>

                {/* Login CTA */}
                <Link
                  href="/login"
                  onClick={() => setMobileMenu(false)}
                  className="block w-full py-3 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-xl font-bold text-center shadow-lg hover:shadow-purple-500/30 transition-all"
                >
                  Member Login
                </Link>
              </div>
            </div>
          )}
        </div>
      </nav>
    </div>
  );
}
