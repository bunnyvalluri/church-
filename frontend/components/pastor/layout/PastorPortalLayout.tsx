"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/components/providers/AuthProvider";
import { useRouter, usePathname } from "next/navigation";
import PastorSidebar from "./PastorSidebar";
import PastorHeader from "./PastorHeader";
import { Layers, Play, Users, Heart, Settings, Loader2 } from "lucide-react";
import Link from "next/link";

import { useLanguage } from "@/components/providers/LanguageProvider";
import { getPastorTranslation } from "@/lib/pastorTranslations";

export default function PastorPortalLayout({ children }: { children: React.ReactNode }) {
  const { mounted, status, user } = useAuth();
  const router = useRouter();
  const pathname = usePathname() || "/pastor/dashboard";
  const { language } = useLanguage();
  const t = getPastorTranslation(language);

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Authentication Guard
  useEffect(() => {
    if (!mounted) return;
    if (status === "unauthenticated") {
      router.replace("/login");
    } else if (
      status === "authenticated" &&
      user &&
      user.role !== "PASTOR" &&
      user.role !== "ADMIN" &&
      user.role !== "SUPER_ADMIN"
    ) {
      router.replace("/dashboard");
    }
  }, [mounted, status, user, router]);

  if (status === "loading" || (user && user.role !== "PASTOR" && user.role !== "ADMIN" && user.role !== "SUPER_ADMIN")) {
    return (
      <div className="h-screen flex items-center justify-center bg-slate-50 dark:bg-[#05060e]">
        <div className="text-center space-y-3">
          <Loader2 className="w-10 h-10 animate-spin text-[#6366F1] mx-auto" />
          <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Securing Pastor Connection...</p>
        </div>
      </div>
    );
  }

  const mobileBottomNavItems = [
    { name: t.mobileDashboard || "Dashboard", href: "/pastor/dashboard", icon: Layers, color: "text-indigo-600 dark:text-indigo-400" },
    { name: t.mobileSermons || "Sermons", href: "/pastor/main/sermons", icon: Play, color: "text-pink-600 dark:text-pink-400" },
    { name: t.mobileMembers || "Members", href: "/pastor/main/member-requests", icon: Users, color: "text-emerald-600 dark:text-emerald-400" },
    { name: t.mobilePrayers || "Prayers", href: "/pastor/main/prayer-requests", icon: Heart, color: "text-rose-600 dark:text-rose-400" },
    { name: t.mobileProfile || "Profile", href: "/pastor/profile", icon: Settings, color: "text-cyan-600 dark:text-cyan-400" }
  ];

  return (
    <div className="h-screen max-h-screen flex bg-slate-50/40 dark:bg-[#05060e] text-slate-900 dark:text-gray-200 font-sans antialiased overflow-hidden relative transition-colors duration-300">
      {/* Background Glow */}
      <div className="premium-glow-bg pointer-events-none" />

      {/* Shared Collapsible / Mobile Sidebar */}
      <PastorSidebar
        isCollapsed={isCollapsed}
        onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
        isMobileOpen={isMobileOpen}
        onMobileClose={() => setIsMobileOpen(false)}
      />

      {/* Mobile Fixed Bottom Navigation Bar */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-[#070814]/95 backdrop-blur-2xl border-t border-slate-200/80 dark:border-white/[0.08] shadow-[0_-4px_24px_rgba(0,0,0,0.12)] flex items-center justify-between px-1.5 py-2 transition-all duration-300">
        {mobileBottomNavItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/pastor/dashboard" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex-1 flex flex-col items-center justify-center gap-1 px-1 py-1 rounded-xl transition-all duration-200 ${
                isActive
                  ? `${item.color} font-black scale-105`
                  : "text-slate-500 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white active:scale-95"
              }`}
            >
              <item.icon className={`w-5 h-5 transition-all duration-200 ${isActive ? `${item.color} scale-110` : ""}`} />
              <span className={`text-[9.5px] font-extrabold uppercase tracking-wider transition-all whitespace-nowrap text-center ${isActive ? item.color : ""}`}>
                {item.name}
              </span>
            </Link>
          );
        })}
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-h-0 overflow-y-auto custom-scrollbar bg-slate-50/40 dark:bg-[#05060e] text-slate-900 dark:text-gray-200 transition-colors duration-300 relative z-10">
        {/* Sticky Top Header */}
        <PastorHeader onToggleMobileSidebar={() => setIsMobileOpen(true)} />

        {/* Page Content Container with bottom padding for mobile bar */}
        <div className="flex-1 p-3.5 sm:p-6 lg:p-8 max-w-[1920px] w-full mx-auto space-y-6 pb-28 lg:pb-8">
          {children}
        </div>
      </main>
    </div>
  );
}
