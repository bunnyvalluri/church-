"use client";

import React, { memo, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Heart,
  Info,
  Image as ImageIcon,
  Video,
  Users,
  Gift,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/components/providers/LanguageProvider";

interface NgoNavItem {
  id: "overview" | "projects" | "gallery" | "videos" | "volunteers" | "donations";
  nameKey: "overview" | "projects" | "gallery" | "videos" | "volunteers" | "donations";
  defaultLabel: string;
  href: string;
  icon: React.ComponentType<{ className?: string; "aria-hidden"?: boolean | "true" | "false" }>;
  iconColor: string;
  activeBgColor: string;
  activeTextColor: string;
  activeBorderColor: string;
}

const NGO_NAV_ITEMS: NgoNavItem[] = [
  {
    id: "overview",
    nameKey: "overview",
    defaultLabel: "Overview",
    href: "/ngo",
    icon: Info,
    iconColor: "text-purple-600 dark:text-purple-400",
    activeBgColor: "bg-purple-100/90 dark:bg-purple-900/60",
    activeTextColor: "text-purple-700 dark:text-purple-300",
    activeBorderColor: "border-purple-300 dark:border-purple-600",
  },
  {
    id: "projects",
    nameKey: "projects",
    defaultLabel: "Projects",
    href: "/ngo/projects",
    icon: Heart,
    iconColor: "text-rose-500 dark:text-rose-400",
    activeBgColor: "bg-rose-100/90 dark:bg-rose-900/60",
    activeTextColor: "text-rose-700 dark:text-rose-300",
    activeBorderColor: "border-rose-300 dark:border-rose-600",
  },
  {
    id: "gallery",
    nameKey: "gallery",
    defaultLabel: "Gallery",
    href: "/ngo/gallery",
    icon: ImageIcon,
    iconColor: "text-emerald-500 dark:text-emerald-400",
    activeBgColor: "bg-emerald-100/90 dark:bg-emerald-900/60",
    activeTextColor: "text-emerald-700 dark:text-emerald-300",
    activeBorderColor: "border-emerald-300 dark:border-emerald-600",
  },
  {
    id: "videos",
    nameKey: "videos",
    defaultLabel: "Videos",
    href: "/ngo/videos",
    icon: Video,
    iconColor: "text-indigo-500 dark:text-indigo-400",
    activeBgColor: "bg-indigo-100/90 dark:bg-indigo-900/60",
    activeTextColor: "text-indigo-700 dark:text-indigo-300",
    activeBorderColor: "border-indigo-300 dark:border-indigo-600",
  },
  {
    id: "volunteers",
    nameKey: "volunteers",
    defaultLabel: "Volunteers",
    href: "/ngo/volunteers",
    icon: Users,
    iconColor: "text-amber-500 dark:text-amber-400",
    activeBgColor: "bg-amber-100/90 dark:bg-amber-900/60",
    activeTextColor: "text-amber-700 dark:text-amber-300",
    activeBorderColor: "border-amber-300 dark:border-amber-600",
  },
  {
    id: "donations",
    nameKey: "donations",
    defaultLabel: "Donations",
    href: "/ngo/donations",
    icon: Gift,
    iconColor: "text-pink-500 dark:text-pink-400",
    activeBgColor: "bg-pink-100/90 dark:bg-pink-900/60",
    activeTextColor: "text-pink-700 dark:text-pink-300",
    activeBorderColor: "border-pink-300 dark:border-pink-600",
  },
];

const NgoSubNav = memo(function NgoSubNav() {
  const pathname = usePathname() ?? "/ngo";
  const { t } = useLanguage();
  const ngoNavT = t?.ngo?.nav || {};
  const navRef = useRef<HTMLElement>(null);
  const mobileScrollRef = useRef<HTMLDivElement>(null);

  // ── Auto-scroll mobile nav track to keep active tab in view ──
  useEffect(() => {
    if (!mobileScrollRef.current) return;
    const activeEl = mobileScrollRef.current.querySelector<HTMLElement>("[data-active='true']");
    if (activeEl) {
      const container = mobileScrollRef.current;
      const scrollLeft = activeEl.offsetLeft - container.offsetWidth / 2 + activeEl.offsetWidth / 2;
      container.scrollTo({ left: scrollLeft, behavior: "smooth" });
    }
  }, [pathname]);

  const isItemActive = (itemHref: string) => {
    if (itemHref === "/ngo") {
      return pathname === "/ngo";
    }
    return pathname === itemHref || pathname.startsWith(itemHref + "/");
  };

  return (
    <nav
      ref={navRef}
      aria-label="NGO Section Navigation"
      className={cn(
        // Sticky position directly below the main KCM header using the measured CSS variable
        "w-full sticky top-[var(--kcm-header-height,56px)] z-[900]",
        // Premium glassmorphism matching KCM design system
        "bg-white/95 dark:bg-slate-950/95 backdrop-blur-2xl",
        "border-b border-slate-200/80 dark:border-slate-800/80",
        "shadow-[0_2px_12px_rgba(0,0,0,0.04)] dark:shadow-[0_4px_20px_rgba(0,0,0,0.3)]",
        "transition-[top,background-color,border-color,box-shadow] duration-200"
      )}
    >
      <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8 py-1.5 sm:py-2">
        {/* ── Mobile View (< md): 6-column balanced dock showing ALL complete names simultaneously ── */}
        <div className="md:hidden" ref={mobileScrollRef}>
          <div className="grid grid-cols-6 gap-0.5 min-[360px]:gap-1 p-1 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800/90 shadow-sm w-full">
            {NGO_NAV_ITEMS.map((item) => {
              const isActive = isItemActive(item.href);
              const Icon = item.icon;
              const label = ngoNavT[item.nameKey] || item.defaultLabel;

              return (
                <Link
                  key={item.id}
                  href={item.href}
                  prefetch={true}
                  data-active={isActive ? "true" : "false"}
                  aria-current={isActive ? "page" : undefined}
                  className={cn(
                    "touch-manipulation flex flex-col items-center justify-center py-1.5 px-0.5 rounded-xl transition-all duration-150 text-center select-none w-full min-w-0 active:scale-95 cursor-pointer",
                    isActive
                      ? "bg-purple-50/90 dark:bg-slate-800 text-purple-700 dark:text-purple-300 shadow-sm border border-purple-300 dark:border-purple-600 font-extrabold"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  )}
                >
                  <span
                    className={cn(
                      "flex items-center justify-center mb-0.5 transition-colors",
                      isActive ? "text-purple-600 dark:text-purple-400" : item.iconColor
                    )}
                  >
                    <Icon className={cn("w-3.5 h-3.5 min-[360px]:w-4 min-[360px]:h-4", isActive && "stroke-[2.5]")} aria-hidden="true" />
                  </span>
                  <span
                    className={cn(
                      "text-[9px] min-[360px]:text-[9.5px] min-[390px]:text-[10px] leading-tight font-bold tracking-tight text-center w-full",
                      isActive ? "text-purple-700 dark:text-purple-300" : "text-slate-700 dark:text-slate-300"
                    )}
                  >
                    {label}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>

        {/* ── Desktop View (≥ md): Brand logo badge on left + Horizontal pills dock on right ── */}
        <div className="hidden md:flex items-center justify-between gap-4 h-12 lg:h-14">
          {/* Brand badge */}
          <Link
            href="/ngo"
            prefetch={true}
            className="touch-manipulation flex items-center gap-2.5 flex-shrink-0 group py-1 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-600"
            aria-label="KCM Social Service NGO Home"
          >
            <div className="w-8 h-8 lg:w-9 lg:h-9 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200/90 dark:border-rose-900/60 flex items-center justify-center text-rose-500 shadow-sm group-hover:scale-105 transition-transform">
              <Heart className="w-4 h-4 lg:w-4.5 lg:h-4.5 fill-rose-500/20" aria-hidden="true" />
            </div>
            <span className="text-xs lg:text-sm font-black tracking-widest uppercase bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 dark:from-purple-400 dark:via-pink-400 dark:to-indigo-400 bg-clip-text text-transparent select-none whitespace-nowrap">
              {ngoNavT.socialService || "KCM SOCIAL SERVICE"}
            </span>
          </Link>

          {/* Navigation tabs pill container */}
          <div
            role="menubar"
            aria-label="NGO Navigation Sections"
            className="flex items-center gap-1.5 p-1 rounded-2xl bg-slate-100/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200/60 dark:border-slate-800/60 flex-shrink-0"
          >
            {NGO_NAV_ITEMS.map((item) => {
              const isActive = isItemActive(item.href);
              const Icon = item.icon;
              const label = ngoNavT[item.nameKey] || item.defaultLabel;

              return (
                <Link
                  key={item.id}
                  href={item.href}
                  prefetch={true}
                  role="menuitem"
                  aria-current={isActive ? "page" : undefined}
                  className={cn(
                    "touch-manipulation flex items-center gap-2 px-3.5 lg:px-4 py-1.5 lg:py-2 rounded-xl text-xs lg:text-sm font-semibold transition-all duration-200 whitespace-nowrap select-none active:scale-95 cursor-pointer",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-600 focus-visible:ring-offset-1",
                    isActive
                      ? "bg-white dark:bg-slate-800 text-purple-700 dark:text-purple-300 shadow-sm border border-purple-200/80 dark:border-purple-700/60 font-bold scale-[1.01]"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/60 dark:hover:bg-slate-800/60"
                  )}
                >
                  <span
                    className={cn(
                      "flex items-center justify-center transition-colors",
                      isActive ? "text-purple-600 dark:text-purple-400" : item.iconColor
                    )}
                  >
                    <Icon className="w-4 h-4" aria-hidden="true" />
                  </span>
                  <span>{label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
});

export default NgoSubNav;
