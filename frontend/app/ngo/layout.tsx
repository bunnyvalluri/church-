"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Heart, Image as ImageIcon, Video, Users, Gift, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/components/providers/LanguageProvider";
import QueryProvider from "@/components/providers/QueryProvider";
import { motion, LayoutGroup } from "framer-motion";

/** Glass specular sheen layers */
function GlassSheen() {
  return (
    <>
      <div className="absolute inset-x-0 top-0 h-[45%] bg-gradient-to-b from-white/55 to-transparent dark:from-white/15 dark:to-transparent pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-br from-white/25 via-transparent to-purple-400/10 dark:from-white/12 dark:to-transparent pointer-events-none" />
      <div className="absolute inset-x-2 bottom-0 h-px bg-white/40 dark:bg-purple-300/20 pointer-events-none" />
    </>
  );
}

const PILL_MOBILE = [
  "absolute inset-0 z-0 rounded-[14px] overflow-hidden",
  "bg-white dark:bg-purple-700",
  "border border-white/80 dark:border-purple-400/50",
  "shadow-[0_2px_12px_rgba(139,92,246,0.28),0_1px_3px_rgba(0,0,0,0.10)]",
].join(" ");

const PILL_DESKTOP = [
  "absolute inset-0 z-0 rounded-[14px] overflow-hidden",
  "bg-white dark:bg-purple-700",
  "border border-white/80 dark:border-purple-400/50",
  "shadow-[0_4px_20px_rgba(139,92,246,0.30),0_1px_4px_rgba(0,0,0,0.08)]",
].join(" ");

const SPRING = { type: "spring" as const, stiffness: 400, damping: 32, mass: 0.65 };

export default function NgoLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() || "";
  const { t } = useLanguage();
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const subNavItems = [
    { name: "Overview",    href: "/ngo",            icon: Info,      color: "text-sky-500 dark:text-sky-400" },
    { name: "Projects",    href: "/ngo/projects",   icon: Heart,     color: "text-rose-500 dark:text-rose-400" },
    { name: "Gallery",     href: "/ngo/gallery",    icon: ImageIcon, color: "text-emerald-500 dark:text-emerald-400" },
    { name: "Videos",      href: "/ngo/videos",     icon: Video,     color: "text-violet-500 dark:text-violet-400" },
    { name: "Volunteers",  href: "/ngo/volunteers", icon: Users,     color: "text-amber-500 dark:text-amber-400" },
    { name: "Donations",   href: "/ngo/donations",  icon: Gift,      color: "text-pink-500 dark:text-pink-400" },
  ];

  // Localised names applied only after mount to avoid SSR/client text mismatch
  const navT = t?.ngo?.nav;
  const localised = mounted && navT ? [
    navT.overview || "Overview",
    navT.projects || "Projects",
    navT.gallery  || "Gallery",
    navT.videos   || "Videos",
    navT.volunteers || "Volunteers",
    navT.donations  || "Donations",
  ] : subNavItems.map(i => i.name);

  const socialService = mounted && navT?.socialService ? navT.socialService : "KCM Social Service";

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white selection:bg-purple-500/30 selection:text-purple-300">
      <Navbar />

      {/* Spacer matching main navbar height */}
      <div className="h-[52px] min-[360px]:h-[56px] sm:h-[60px] md:h-[64px] lg:h-[72px] xl:h-[108px] 2xl:h-[112px]" />

      {/* ── NGO Sub-Navbar ─────────────────────────────────────────────────── */}
      <div
        suppressHydrationWarning
        className="sticky top-[52px] min-[360px]:top-[56px] sm:top-[60px] md:top-[64px] lg:top-[72px] 2xl:top-[76px] z-40 w-full bg-white/80 dark:bg-slate-950/85 backdrop-blur-2xl border-b border-slate-200/70 dark:border-white/[0.07] shadow-[0_1px_0_rgba(0,0,0,0.04),0_4px_24px_rgba(0,0,0,0.04)] dark:shadow-[0_4px_32px_rgba(139,92,246,0.08)] py-2 sm:py-2.5"
      >
        <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-3">

            {/* Brand badge — lg+ only */}
            <div className="hidden lg:flex items-center gap-2.5 flex-shrink-0 select-none">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-red-500/20 to-purple-600/20 border border-red-400/30 flex items-center justify-center">
                <Heart className="w-4 h-4 text-red-500 fill-red-400/30 animate-pulse" />
              </div>
              <span suppressHydrationWarning className="font-black text-xs uppercase tracking-widest bg-gradient-to-r from-red-500 via-pink-500 to-purple-600 dark:from-red-400 dark:via-pink-400 dark:to-purple-400 bg-clip-text text-transparent whitespace-nowrap">
                {socialService}
              </span>
            </div>

            {/* ── MOBILE: 6-col segmented glass pill bar ── */}
            <div className="w-full sm:hidden">
              <div
                suppressHydrationWarning
                className="grid grid-cols-6 gap-0.5 p-1 rounded-[18px] bg-slate-100/90 dark:bg-[#0f1729]/95 border border-slate-200/80 dark:border-white/[0.07] backdrop-blur-xl shadow-inner shadow-black/5 dark:shadow-black/30"
              >
                <LayoutGroup id="ngo-mobile">
                  {subNavItems.map((item, i) => {
                    const isActive = item.href === "/ngo"
                      ? pathname === "/ngo"
                      : pathname.startsWith(item.href);
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        suppressHydrationWarning
                        className="relative flex flex-col items-center justify-center gap-[3px] py-[7px] px-0.5 rounded-[14px] min-w-0 select-none"
                      >
                        {/* Animated pill — only after mount to prevent hydration mismatch */}
                        {mounted && isActive && (
                          <motion.div
                            layoutId="ngo-mobile-pill"
                            className={PILL_MOBILE}
                            transition={SPRING}
                            aria-hidden="true"
                          >
                            <GlassSheen />
                          </motion.div>
                        )}

                        {/* Static pill for pre-mount (same classes, no layoutId) */}
                        {!mounted && isActive && (
                          <div className={PILL_MOBILE} aria-hidden="true">
                            <GlassSheen />
                          </div>
                        )}

                        <Icon suppressHydrationWarning className={cn(
                          "w-[14px] h-[14px] z-10 flex-shrink-0 transition-transform duration-300 ease-out",
                          isActive
                            ? "scale-110 text-purple-600 dark:text-white drop-shadow-[0_1px_3px_rgba(139,92,246,0.45)]"
                            : cn("scale-100", item.color)
                        )} />

                        <span suppressHydrationWarning className={cn(
                          "z-10 text-[8px] min-[360px]:text-[9px] font-black leading-none text-center w-full transition-colors duration-200",
                          isActive ? "text-purple-700 dark:text-white" : "text-slate-500 dark:text-slate-400"
                        )}>
                          {localised[i]}
                        </span>
                      </Link>
                    );
                  })}
                </LayoutGroup>
              </div>
            </div>

            {/* ── DESKTOP / TABLET: pill tab bar ── */}
            <nav
              suppressHydrationWarning
              className="hidden sm:flex items-center gap-0.5 p-1.5 rounded-[20px] bg-slate-100/90 dark:bg-[#0f1729]/95 border border-slate-200/80 dark:border-white/[0.07] backdrop-blur-xl shadow-inner shadow-black/5 dark:shadow-black/30"
            >
              <LayoutGroup id="ngo-desktop">
                {subNavItems.map((item, i) => {
                  const isActive = item.href === "/ngo"
                    ? pathname === "/ngo"
                    : pathname.startsWith(item.href);
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      suppressHydrationWarning
                      className="relative flex items-center gap-2 px-3 lg:px-4 py-2 lg:py-2.5 rounded-[14px] whitespace-nowrap select-none"
                    >
                      {/* Animated pill — only after mount */}
                      {mounted && isActive && (
                        <motion.div
                          layoutId="ngo-desktop-pill"
                          className={PILL_DESKTOP}
                          transition={SPRING}
                          aria-hidden="true"
                        >
                          <GlassSheen />
                        </motion.div>
                      )}

                      {/* Static pill for pre-mount */}
                      {!mounted && isActive && (
                        <div className={PILL_DESKTOP} aria-hidden="true">
                          <GlassSheen />
                        </div>
                      )}

                      <Icon suppressHydrationWarning className={cn(
                        "w-[15px] h-[15px] lg:w-4 lg:h-4 z-10 flex-shrink-0 transition-all duration-300 ease-out",
                        isActive
                          ? "scale-110 -rotate-3 text-purple-600 dark:text-white drop-shadow-[0_1px_4px_rgba(139,92,246,0.45)]"
                          : cn("scale-100 rotate-0", item.color)
                      )} />

                      <span suppressHydrationWarning className={cn(
                        "z-10 text-xs lg:text-[13px] font-extrabold tracking-tight transition-all duration-200",
                        isActive
                          ? "text-purple-700 dark:text-white opacity-100"
                          : "text-slate-500 dark:text-slate-400 opacity-70 hover:opacity-100"
                      )}>
                        {localised[i]}
                      </span>
                    </Link>
                  );
                })}
              </LayoutGroup>
            </nav>

          </div>
        </div>
      </div>

      {/* NGO Content */}
      <main id="main-content" className="min-h-[60vh] relative">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-5 pointer-events-none" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full filter blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-pink-500/10 rounded-full filter blur-3xl pointer-events-none" />
        <QueryProvider>
          <div className="relative z-10">{children}</div>
        </QueryProvider>
      </main>

      <Footer />
    </div>
  );
}
