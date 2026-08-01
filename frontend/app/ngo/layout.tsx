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

      {/* Responsive spacing matching header height across viewports */}
      <div className="h-[52px] min-[360px]:h-[56px] sm:h-[60px] md:h-[64px] lg:h-[72px]" />

      {/* Dedicated NGO Sub-Navbar Bar */}
      <div className="sticky top-[52px] min-[360px]:top-[56px] sm:top-[60px] md:top-[64px] lg:top-[72px] z-40 bg-white/90 dark:bg-slate-950/90 backdrop-blur-md border-b border-slate-200/80 dark:border-white/10 py-2 sm:py-2.5 shadow-sm">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-3">
            
            {/* Title / Badge - hidden on small screens to prioritize clean tab scrolling */}
            <div className="hidden sm:flex items-center gap-2 flex-shrink-0">
              <div className="w-7 h-7 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                <Heart className="w-4 h-4 text-red-500 fill-red-500/20 animate-pulse" />
              </div>
              <span className="font-extrabold tracking-tight text-xs sm:text-sm uppercase bg-gradient-to-r from-red-500 via-pink-500 to-purple-600 dark:from-red-400 dark:via-pink-400 dark:to-purple-400 bg-clip-text text-transparent">
                {navT.socialService || "KCM Social Service"}
              </span>
            </div>

            {/* Horizontal Scrollable Tabs */}
            <div className="w-full sm:w-auto overflow-x-auto no-scrollbar scroll-smooth -mx-3 px-3 sm:mx-0 sm:px-0">
              <nav className="flex items-center gap-1.5 min-w-max py-0.5">
                {subNavItems.map((item) => {
                  const isActive = pathname === item.href;
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl transition-all duration-200 whitespace-nowrap border",
                        isActive
                          ? "bg-purple-600 text-white border-purple-600 shadow-md shadow-purple-500/20 dark:bg-purple-500 dark:border-purple-500"
                          : "bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 border-slate-200/80 dark:border-white/10"
                      )}
                    >
                      <Icon className={cn("w-3.5 h-3.5", isActive ? "text-white" : item.colorClass)} />
                      <span>{item.name}</span>
                    </Link>
                  );
                })}
              </nav>
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
