"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Heart, Image as ImageIcon, Video, Users, Gift, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { translations } from "@/lib/translations";

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

  const ngoT = mounted ? t.ngo : translations.en.ngo;

  const subNavItems = [
    {
      name: ngoT.nav.overview,
      href: "/ngo",
      icon: Info,
      colorClass: "text-blue-500 dark:text-blue-400",
      activeBg: "bg-blue-500/10 dark:bg-blue-500/20 border-blue-400/30 dark:border-blue-500/30 shadow-md shadow-blue-500/5",
      activeText: "text-blue-600 dark:text-blue-300",
      hoverClass: "group-hover:rotate-12 transition-transform duration-300",
    },
    {
      name: ngoT.nav.projects,
      href: "/ngo/projects",
      icon: Heart,
      colorClass: "text-rose-500 dark:text-rose-400",
      activeBg: "bg-rose-500/10 dark:bg-rose-500/20 border-rose-400/30 dark:border-rose-500/30 shadow-md shadow-rose-500/5",
      activeText: "text-rose-600 dark:text-rose-300",
      hoverClass: "group-hover:scale-110 group-hover:animate-pulse transition-transform duration-300",
    },
    {
      name: ngoT.nav.gallery,
      href: "/ngo/gallery",
      icon: ImageIcon,
      colorClass: "text-emerald-500 dark:text-emerald-400",
      activeBg: "bg-emerald-500/10 dark:bg-emerald-500/20 border-emerald-400/30 dark:border-emerald-500/30 shadow-md shadow-emerald-500/5",
      activeText: "text-emerald-600 dark:text-emerald-300",
      hoverClass: "group-hover:translate-y-[-2px] transition-transform duration-300",
    },
    {
      name: ngoT.nav.videos,
      href: "/ngo/videos",
      icon: Video,
      colorClass: "text-purple-500 dark:text-purple-400",
      activeBg: "bg-purple-500/10 dark:bg-purple-500/20 border-purple-400/30 dark:border-purple-500/30 shadow-md shadow-purple-500/5",
      activeText: "text-purple-600 dark:text-purple-300",
      hoverClass: "group-hover:scale-110 transition-transform duration-300",
    },
    {
      name: ngoT.nav.volunteers,
      href: "/ngo/volunteers",
      icon: Users,
      colorClass: "text-amber-500 dark:text-amber-400",
      activeBg: "bg-amber-500/10 dark:bg-amber-500/20 border-amber-400/30 dark:border-amber-500/30 shadow-md shadow-amber-500/5",
      activeText: "text-amber-600 dark:text-amber-300",
      hoverClass: "group-hover:translate-x-[2px] transition-transform duration-300",
    },
    {
      name: ngoT.nav.donations,
      href: "/ngo/donations",
      icon: Gift,
      colorClass: "text-pink-500 dark:text-pink-400",
      activeBg: "bg-pink-500/10 dark:bg-pink-500/20 border-pink-400/30 dark:border-pink-500/30 shadow-md shadow-pink-500/5",
      activeText: "text-pink-600 dark:text-pink-300",
      hoverClass: "group-hover:animate-bounce transition-transform duration-300",
    },
  ];

  return (
    <div className="min-h-screen bg-transparent text-slate-900 dark:text-white selection:bg-purple-500/30 selection:text-purple-300">
      {/* Main Global Navbar */}
      <Navbar />

      {/* Spacing for main sticky navbar */}
      <div className="h-[76px] xl:h-[112px]" />

      {/* Dedicated NGO Glassmorphic Sub-Navbar */}
      <div className="sticky top-[64px] xl:top-[100px] z-40 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-slate-200/80 dark:border-white/5 py-3">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-4 overflow-x-auto no-scrollbar scroll-smooth">
            <div className="flex items-center gap-1.5 flex-shrink-0">
              <Heart className="w-5 h-5 text-red-500 animate-pulse" />
              <span className="font-bold tracking-tight text-sm sm:text-base uppercase bg-gradient-to-r from-red-500 via-pink-500 to-purple-500 dark:from-red-400 dark:via-pink-400 dark:to-purple-400 bg-clip-text text-transparent">
                {ngoT.nav.socialService}
              </span>
            </div>
            
            <nav className="flex items-center gap-1">
              {subNavItems.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl transition-all duration-300 whitespace-nowrap border group",
                      isActive
                        ? `${item.activeBg} ${item.activeText}`
                        : "text-slate-500 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white border-transparent hover:bg-slate-100 dark:hover:bg-white/5"
                    )}
                  >
                    <Icon className={cn("w-4 h-4", item.colorClass, item.hoverClass)} />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      </div>

      {/* NGO Content Area */}
      <main className="min-h-[60vh] relative overflow-hidden">
        {/* Decorative Grid overlays */}
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-5 pointer-events-none" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full filter blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-pink-500/10 rounded-full filter blur-3xl pointer-events-none" />
        
        <div className="relative z-10">{children}</div>
      </main>

      {/* Global Footer */}
      <Footer />
    </div>
  );
}
