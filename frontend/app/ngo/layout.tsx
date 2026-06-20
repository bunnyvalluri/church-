"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Heart, Image as ImageIcon, Video, Users, Gift, Info } from "lucide-react";
import { cn } from "@/lib/utils";

export default function NgoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname() || "";

  const subNavItems = [
    { name: "Overview", href: "/ngo", icon: Info },
    { name: "Projects", href: "/ngo/projects", icon: Heart },
    { name: "Gallery", href: "/ngo/gallery", icon: ImageIcon },
    { name: "Videos", href: "/ngo/videos", icon: Video },
    { name: "Volunteers", href: "/ngo/volunteers", icon: Users },
    { name: "Donations", href: "/ngo/donations", icon: Gift },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-white selection:bg-purple-500/30 selection:text-purple-300">
      {/* Main Global Navbar */}
      <Navbar />

      {/* Spacing for main sticky navbar */}
      <div className="h-16 xl:h-24" />

      {/* Dedicated NGO Glassmorphic Sub-Navbar */}
      <div className="sticky top-16 xl:top-20 z-40 bg-slate-950/80 backdrop-blur-md border-b border-white/5 py-3">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-4 overflow-x-auto no-scrollbar scroll-smooth">
            <div className="flex items-center gap-1.5 flex-shrink-0">
              <Heart className="w-5 h-5 text-red-500 animate-pulse" />
              <span className="font-bold tracking-tight text-sm sm:text-base uppercase bg-gradient-to-r from-red-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
                KCM Social Service
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
                      "flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl transition-all duration-300 whitespace-nowrap border",
                      isActive
                        ? "bg-purple-600/20 text-purple-300 border-purple-500/30 shadow-md shadow-purple-500/5"
                        : "text-gray-400 hover:text-white border-transparent hover:bg-white/5"
                    )}
                  >
                    <Icon className="w-3.5 h-3.5" />
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
