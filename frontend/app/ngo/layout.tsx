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

export default function NgoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname() || "";
  const { t } = useLanguage();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const navT = t?.ngo?.nav || {
    overview: "Overview",
    projects: "Projects",
    gallery: "Gallery",
    videos: "Videos",
    volunteers: "Volunteers",
    donations: "Donations",
    socialService: "KCM Social Service",
  };

  const subNavItems = [
    {
      name: navT.overview || "Overview",
      href: "/ngo",
      icon: Info,
      colorClass: "text-blue-500 dark:text-blue-400",
    },
    {
      name: navT.projects || "Projects",
      href: "/ngo/projects",
      icon: Heart,
      colorClass: "text-rose-500 dark:text-rose-400",
    },
    {
      name: navT.gallery || "Gallery",
      href: "/ngo/gallery",
      icon: ImageIcon,
      colorClass: "text-emerald-500 dark:text-emerald-400",
    },
    {
      name: navT.videos || "Videos",
      href: "/ngo/videos",
      icon: Video,
      colorClass: "text-purple-500 dark:text-purple-400",
    },
    {
      name: navT.volunteers || "Volunteers",
      href: "/ngo/volunteers",
      icon: Users,
      colorClass: "text-amber-500 dark:text-amber-400",
    },
    {
      name: navT.donations || "Donations",
      href: "/ngo/donations",
      icon: Gift,
      colorClass: "text-pink-500 dark:text-pink-400",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white selection:bg-purple-500/30 selection:text-purple-300">
      {/* Main Global Navbar */}
      <Navbar />

      {/* Responsive spacing matching header height across viewports (including TopInfoBar on xl+) */}
      <div className="h-[52px] min-[360px]:h-[56px] sm:h-[60px] md:h-[64px] lg:h-[72px] xl:h-[108px] 2xl:h-[112px]" />

      {/* Dedicated NGO Sub-Navbar Bar */}
      <div className="sticky top-[52px] min-[360px]:top-[56px] sm:top-[60px] md:top-[64px] lg:top-[72px] 2xl:top-[76px] z-40 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700/60 shadow-sm">
        <div className="max-w-7xl mx-auto">

          {/* ── MOBILE: 6-column segmented control (all 6 visible without scrolling) ── */}
          <div className="sm:hidden px-2 py-1.5">
            <div className="grid grid-cols-6 gap-0.5 bg-slate-100 dark:bg-slate-800 rounded-xl p-0.5 border border-slate-200/60 dark:border-slate-700/60">
              {subNavItems.map((item) => {
                const isActive = mounted
                  ? (item.href === "/ngo" ? pathname === "/ngo" : pathname.startsWith(item.href))
                  : false;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex flex-col items-center justify-center gap-0.5 py-1.5 rounded-lg transition-all duration-200 min-w-0",
                      isActive
                        ? "bg-white dark:bg-purple-600 shadow-sm text-purple-700 dark:text-white"
                        : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
                    )}
                  >
                    <Icon className={cn(
                      "w-3.5 h-3.5 flex-shrink-0",
                      isActive ? "text-purple-600 dark:text-white" : item.colorClass
                    )} />
                    <span className={cn(
                      "leading-none text-center w-full truncate px-0.5 font-bold",
                      isActive ? "text-[9px]" : "text-[8.5px]"
                    )}>
                      {item.name}
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* ── DESKTOP / TABLET: pill tab row ── */}
          <div className="hidden sm:flex items-center gap-3 px-6 lg:px-8 py-2">

            {/* Brand Badge */}
            <div className="hidden lg:flex items-center gap-2 flex-shrink-0">
              <div className="w-7 h-7 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                <Heart className="w-4 h-4 text-red-500 fill-red-500/20 animate-pulse" />
              </div>
              <span className="font-extrabold tracking-tight text-xs uppercase bg-gradient-to-r from-red-500 via-pink-500 to-purple-600 dark:from-red-400 dark:via-pink-400 dark:to-purple-400 bg-clip-text text-transparent whitespace-nowrap">
                {navT.socialService || "KCM Social Service"}
              </span>
            </div>

            <div className="hidden lg:block w-px h-5 bg-slate-200 dark:bg-slate-700 flex-shrink-0" />

            {/* Tab pills inside a tinted container */}
            <div className="flex items-center gap-0.5 bg-slate-100 dark:bg-slate-800 rounded-xl px-1 py-1">
              {subNavItems.map((item) => {
                const isActive = mounted
                  ? (item.href === "/ngo" ? pathname === "/ngo" : pathname.startsWith(item.href))
                  : false;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all duration-200 whitespace-nowrap",
                      isActive
                        ? "bg-white dark:bg-purple-600 text-purple-700 dark:text-white shadow-sm"
                        : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-white/60 dark:hover:bg-slate-700/60"
                    )}
                  >
                    <Icon className={cn(
                      "w-3.5 h-3.5 flex-shrink-0",
                      isActive ? "text-purple-600 dark:text-white" : item.colorClass
                    )} />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </div>
          </div>

        </div>
      </div>

      {/* NGO Content Area */}
      <main id="main-content" className="min-h-[60vh] relative">
        {/* Decorative background accents */}
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-5 pointer-events-none" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full filter blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-pink-500/10 rounded-full filter blur-3xl pointer-events-none" />
        
        <QueryProvider>
          <div className="relative z-10">{children}</div>
        </QueryProvider>
      </main>

      {/* Global Footer */}
      <Footer />
    </div>
  );
}
