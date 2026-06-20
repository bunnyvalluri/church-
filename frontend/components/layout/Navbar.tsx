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
import { useLanguage } from "@/components/providers/LanguageProvider";
import { useAuth } from "@/components/providers/AuthProvider";

export default function Navbar() {
  const { t, language } = useLanguage();
  const { user } = useAuth();
  const pathname = usePathname() || "/";
  const isHomePage = pathname === "/";
  const [isScrolled, setIsScrolled]       = useState(false);
  const [isMobileMenuOpen, setMobileMenu] = useState(false);
  const [activeSection, setActiveSection] = useState("home");
  const [mounted, setMounted]             = useState(false);

  const resolveHref = (href: string) =>
    href.startsWith("/") ? href : isHomePage ? href : `/${href}`;

  const navItems = [
    { name: mounted ? t.nav.home       : "Home",       href: "#home" },
    { name: mounted ? t.nav.about      : "About",      href: "#about" },
    { name: mounted ? t.nav.ministries : "Ministries", href: "#services" },
    { name: mounted ? t.nav.events     : "Events",     href: "#events" },
    { name: mounted ? t.nav.sermons    : "Sermons",    href: "#sermons" },
    { name: mounted ? t.nav.gallery    : "Gallery",    href: "/gallery" },
    { name: mounted ? t.nav.contact    : "Contact",    href: "/contact" },
  ];

  const socialLinks = [
    { icon: Instagram, href: "https://instagram.com", label: "Instagram",  color: "hover:text-[#E1306C]", bg: "bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888]" },
    { icon: Youtube,   href: "https://youtube.com/@kcmchurchshapur7107?si=NbnoJjdl5lqt7fkO", label: "YouTube", color: "hover:text-[#FF0000]", bg: "bg-[#FF0000]" },
  ];

  useEffect(() => {
    setMounted(true);
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
            <a href="tel:+919704090069" className="flex items-center gap-1.5 hover:text-white transition-colors group">
              <Phone className="w-3 h-3" />
              <span className="font-medium">+91 97040 90069</span>
            </a>
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
            <Link href="/" className="flex items-center gap-3 group flex-shrink-0 min-w-0">
              {/* Logo circle */}
              <div className="relative w-12 h-12 sm:w-14 sm:h-14 flex-shrink-0">
                <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-violet-500 via-purple-500 to-violet-600 opacity-0 group-hover:opacity-100 blur-md transition-opacity duration-500 scale-125" />
                <div className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-full overflow-hidden border-2 border-purple-300/40 group-hover:border-purple-400/70 shadow-lg transition-all duration-300 bg-white flex items-center justify-center">
                  <Image src="/logo.png" alt="KCM Logo" fill className="object-contain p-0.5" priority />
                </div>
              </div>

              {/* Name — whitespace-nowrap prevents wrapping */}
              <div className="flex flex-col min-w-0">
                <span
                  suppressHydrationWarning
                  className={cn(
                    "font-black leading-tight text-gray-900 dark:text-white whitespace-nowrap",
                    "text-base sm:text-lg",
                    mounted && language !== "en" ? "tracking-normal" : "tracking-tight"
                  )}
                >
                  {mounted ? t.nav.churchName : "Kingdom of Christ"}
                </span>
                <span
                  suppressHydrationWarning
                  className={cn(
                    "leading-none whitespace-nowrap",
                    mounted && language !== "en"
                      ? "text-sm font-extrabold text-purple-600 dark:text-purple-400 tracking-normal"
                      : "text-[0.6rem] font-bold uppercase tracking-[0.2em] bg-gradient-to-r from-purple-600 to-violet-500 bg-clip-text text-transparent"
                  )}
                >
                  {mounted ? t.nav.ministries : "Ministries"}
                </span>
              </div>
            </Link>

            {/* ── Desktop Nav Links (md+) ── */}
            <div className="hidden md:flex items-center gap-1 flex-1 justify-center">
              {navItems.map((item) => {
                const isActive = activeSection === item.href.replace("#", "");
                return (
                  <Link
                    key={item.href}
                    href={resolveHref(item.href)}
                    className={cn(
                      "relative px-3 py-1.5 text-sm font-semibold rounded-lg transition-all duration-200 whitespace-nowrap",
                      isActive
                        ? "text-purple-700 dark:text-purple-400"
                        : "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-gray-100/60 dark:hover:bg-white/5"
                    )}
                  >
                    {isActive && (
                      <span className="absolute inset-0 rounded-lg bg-purple-50 dark:bg-purple-500/10 border border-purple-200/50 dark:border-purple-500/20" />
                    )}
                    <span className="relative z-10">{item.name}</span>
                  </Link>
                );
              })}
            </div>

            {/* ── Right Controls ── */}
            <div className="flex items-center gap-2 flex-shrink-0">
              {/* Toggles — hidden on mobile to save space */}
              <div className="hidden md:flex items-center gap-1 bg-gray-100/70 dark:bg-white/5 border border-gray-200/80 dark:border-white/10 p-1 rounded-xl backdrop-blur-md">
                <LanguageToggle />
                <ThemeToggle />
                <PaletteToggle />
              </div>

              {/* Member Login — desktop only */}
              <Link
                href="/login"
                className="hidden md:flex items-center relative px-4 py-2 rounded-xl font-bold text-white text-sm overflow-hidden group shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105 active:scale-95 whitespace-nowrap"
              >
                <span className="absolute inset-0 bg-gradient-to-r from-violet-600 to-purple-600 group-hover:from-violet-500 group-hover:to-purple-500 transition-all duration-300" />
                <span className="relative z-10">Member Login</span>
              </Link>

              {/* ── Hamburger (< md) ── */}
              <button
                onClick={() => setMobileMenu(!isMobileMenuOpen)}
                aria-label="Toggle menu"
                className="md:hidden p-2 rounded-xl bg-gray-100/80 dark:bg-white/10 border border-gray-200 dark:border-white/20 text-gray-800 dark:text-white hover:bg-gray-200 dark:hover:bg-white/20 transition-all"
              >
                {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </div>

          {/* ── Mobile Dropdown Menu ── */}
          {isMobileMenuOpen && (
            <div className="md:hidden mt-3 mb-1 p-4 bg-white/98 dark:bg-gray-950/98 backdrop-blur-2xl rounded-2xl shadow-2xl border border-gray-200/80 dark:border-white/10 animate-scale-in">

              {/* Nav links */}
              <nav className="space-y-0.5">
                {navItems.map((item) => {
                  const isActive = activeSection === item.href.replace("#", "");
                  return (
                    <Link
                      key={item.href}
                      href={resolveHref(item.href)}
                      onClick={() => setMobileMenu(false)}
                      className={cn(
                        "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all",
                        isActive
                          ? "bg-purple-50 dark:bg-purple-500/10 text-purple-700 dark:text-purple-400 border-l-[3px] border-purple-500"
                          : "text-gray-600 hover:text-gray-900 hover:bg-gray-50 dark:text-gray-400 dark:hover:text-white dark:hover:bg-white/5"
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
