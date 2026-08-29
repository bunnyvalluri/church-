"use client";

import React, { memo } from "react";
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
  id: string;
  nameKey: "overview" | "projects" | "gallery" | "videos" | "volunteers" | "donations";
  defaultLabel: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
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
    activeBgColor: "bg-purple-100/80 dark:bg-purple-900/60",
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
    activeBgColor: "bg-rose-100/80 dark:bg-rose-900/60",
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
    activeBgColor: "bg-emerald-100/80 dark:bg-emerald-900/60",
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
    activeBgColor: "bg-indigo-100/80 dark:bg-indigo-900/60",
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
    activeBgColor: "bg-amber-100/80 dark:bg-amber-900/60",
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
    activeBgColor: "bg-pink-100/80 dark:bg-pink-900/60",
    activeTextColor: "text-pink-700 dark:text-pink-300",
    activeBorderColor: "border-pink-300 dark:border-pink-600",
  },
];

const NgoSubNav = memo(function NgoSubNav() {
  const pathname = usePathname() ?? "/ngo";
  const { t } = useLanguage();
  const ngoNavT = t?.ngo?.nav || {};

  return (
    <nav
      aria-label="NGO Section Navigation"
      className={cn(
        "w-full sticky top-[52px] min-[360px]:top-[56px] sm:top-[60px] md:top-[64px] lg:top-[72px] z-30",
        "bg-white/95 dark:bg-slate-950/95 backdrop-blur-xl",
        "border-b border-slate-200/80 dark:border-slate-800/80",
        "shadow-[0_2px_12px_rgba(0,0,0,0.04)] dark:shadow-[0_4px_20px_rgba(0,0,0,0.3)]",
        "transition-all duration-200"
      )}
    >
      <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8 py-1.5 sm:py-2">
        {/* Mobile View: 6-column balanced dock where all items fit perfectly (< md) */}
        <div className="md:hidden">
          <div className="grid grid-cols-6 gap-0.5 p-1 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm w-full">
            {NGO_NAV_ITEMS.map((item) => {
              const isActive =
                item.href === "/ngo"
                  ? pathname === "/ngo"
                  : pathname.startsWith(item.href);

              const Icon = item.icon;
              const label = ngoNavT[item.nameKey] || item.defaultLabel;

              return (
                <Link
                  key={item.id}
                  href={item.href}
                  className={cn(
                    "flex flex-col items-center justify-center py-1.5 px-0.5 rounded-xl transition-all duration-150 text-center select-none w-full",
                    isActive
                      ? "bg-purple-50/80 dark:bg-slate-800 text-purple-700 dark:text-purple-300 shadow-sm border border-purple-300 dark:border-purple-600 font-bold"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  )}
                >
                  <span
                    className={cn(
                      "flex items-center justify-center mb-0.5 transition-colors",
                      isActive ? "text-purple-600 dark:text-purple-400" : item.iconColor
                    )}
                  >
                    <Icon className={cn("w-4 h-4", isActive && "stroke-[2.5]")} />
                  </span>
                  <span
                    className={cn(
                      "text-[9px] min-[360px]:text-[9.5px] min-[390px]:text-[10px] leading-tight font-bold tracking-tight text-center",
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

        {/* Desktop View (≥ md): Brand logo on left + horizontal pills dock on right */}
        <div className="hidden md:flex items-center justify-between gap-4 h-12 lg:h-14">
          {/* Brand badge */}
          <Link
            href="/ngo"
            className="flex items-center gap-2.5 flex-shrink-0 group py-1"
          >
            <div className="w-8 h-8 lg:w-9 lg:h-9 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200/90 dark:border-rose-900/60 flex items-center justify-center text-rose-500 shadow-sm group-hover:scale-105 transition-transform">
              <Heart className="w-4 h-4 lg:w-4.5 lg:h-4.5 fill-rose-500/20" />
            </div>
            <span className="text-xs lg:text-sm font-black tracking-widest uppercase bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 dark:from-purple-400 dark:via-pink-400 dark:to-indigo-400 bg-clip-text text-transparent select-none whitespace-nowrap">
              {ngoNavT.socialService || "KCM SOCIAL SERVICE"}
            </span>
          </Link>

          {/* Navigation tabs pill container */}
          <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-slate-100/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200/60 dark:border-slate-800/60 flex-shrink-0">
            {NGO_NAV_ITEMS.map((item) => {
              const isActive =
                item.href === "/ngo"
                  ? pathname === "/ngo"
                  : pathname.startsWith(item.href);

              const Icon = item.icon;
              const label = ngoNavT[item.nameKey] || item.defaultLabel;

              return (
                <Link
                  key={item.id}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-2 px-3.5 lg:px-4 py-1.5 lg:py-2 rounded-xl text-xs lg:text-sm font-semibold transition-all duration-200 whitespace-nowrap select-none",
                    isActive
                      ? "bg-white dark:bg-slate-800 text-purple-700 dark:text-purple-300 shadow-sm border border-purple-200/80 dark:border-purple-700/60 font-bold"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/60 dark:hover:bg-slate-800/60"
                  )}
                >
                  <span
                    className={cn(
                      "flex items-center justify-center transition-colors",
                      isActive ? "text-purple-600 dark:text-purple-400" : item.iconColor
                    )}
                  >
                    <Icon className="w-4 h-4" />
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
