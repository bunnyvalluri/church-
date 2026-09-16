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
      const currentPath = typeof window !== "undefined" ? window.location.pathname + window.location.search : "/pastor/main/dashboard";
      router.replace(`/login?next=${encodeURIComponent(currentPath)}`);
    } else if (
      status === "authenticated" &&
      user &&
      user.role !== "PASTOR" &&
      user.role !== "ADMIN" &&
      user.role !== "SUPER_ADMIN"
    ) {
      router.replace("/member");
    }
  }, [mounted, status, user, router]);

  if (!mounted || status === "loading" || status === "unauthenticated" || !user || (user.role !== "PASTOR" && user.role !== "ADMIN" && user.role !== "SUPER_ADMIN")) {
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
    { name: t.mobileDashboard || "Dashboard", href: "/pastor/main/dashboard", icon: Layers, color: "text-indigo-600 dark:text-indigo-400" },
    { name: t.mobileSermons || "Sermons", href: "/pastor/main/sermons", icon: Play, color: "text-pink-600 dark:text-pink-400" },
    { name: t.mobileMembers || "Members", href: "/pastor/main/member-requests", icon: Users, color: "text-emerald-600 dark:text-emerald-400" },
    { name: t.mobilePrayers || "Prayers", href: "/pastor/main/prayer-requests", icon: Heart, color: "text-rose-600 dark:text-rose-400" },
    { name: t.mobileProfile || "Profile", href: "/pastor/main/profile", icon: Settings, color: "text-cyan-600 dark:text-cyan-400" }
  ];

  return (
    <div className="h-[100dvh] max-h-[100dvh] flex bg-slate-50/40 dark:bg-[#05060e] text-slate-900 dark:text-gray-200 font-sans antialiased overflow-hidden relative transition-colors duration-300" suppressHydrationWarning>
      {/* Background Glow */}
      <div className="premium-glow-bg pointer-events-none" />

      {/* Shared Collapsible / Mobile Sidebar */}
      <PastorSidebar
        isCollapsed={isCollapsed}
        onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
        isMobileOpen={isMobileOpen}
        onMobileClose={() => setIsMobileOpen(false)}
      />

      {/* Mobile Ultra-Premium Floating Glassmorphic Bottom Dock */}
      {!isMobileOpen && (
        <div className="lg:hidden fixed bottom-2.5 sm:bottom-4 inset-x-2.5 sm:inset-x-auto sm:left-1/2 sm:-translate-x-1/2 sm:w-[440px] z-40 pointer-events-auto select-none">
          <nav className="bg-white/95 dark:bg-[#0c0e1a]/95 backdrop-blur-2xl border border-slate-200/90 dark:border-white/[0.12] rounded-2xl p-1 shadow-[0_10px_30px_-5px_rgba(0,0,0,0.12),0_0_0_1px_rgba(0,0,0,0.04)] dark:shadow-[0_12px_36px_-6px_rgba(0,0,0,0.7),0_0_0_1px_rgba(255,255,255,0.06)] flex items-center justify-around gap-1 transition-all duration-200">
            {mobileBottomNavItems.map((item) => {
              const isActive = pathname === item.href || (item.href !== "/pastor/dashboard" && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`relative flex-1 min-w-0 flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition-all duration-200 active:scale-95 ${
                    isActive
                      ? "bg-slate-100/90 dark:bg-white/[0.08] shadow-xs"
                      : "hover:bg-slate-50 dark:hover:bg-white/[0.04]"
                  }`}
                >
                  {/* Active Indicator Top Glow Line */}
                  {isActive && (
                    <span className="absolute top-0.5 w-5 h-0.5 rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 shadow-xs" />
                  )}

                  <div className="relative flex items-center justify-center mt-0.5">
                    <item.icon
                      className={`w-5 h-5 transition-transform duration-200 ${
                        isActive
                          ? `${item.color} scale-105`
                          : "text-slate-400 dark:text-gray-400"
                      }`}
                    />
                  </div>

                  <span
                    className={`text-[10px] font-semibold tracking-tight mt-1 transition-colors duration-200 text-center leading-tight truncate max-w-full ${
                      isActive
                        ? `${item.color} font-bold`
                        : "text-slate-500 dark:text-gray-400"
                    }`}
                  >
                    {item.name}
                  </span>
                </Link>
              );
            })}
          </nav>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-h-0 overflow-y-auto custom-scrollbar bg-slate-50/40 dark:bg-[#05060e] text-slate-900 dark:text-gray-200 transition-colors duration-300 relative z-10">
        {/* Sticky Top Header */}
        <PastorHeader onToggleMobileSidebar={() => setIsMobileOpen(true)} />

        {/* Page Content Container with bottom padding for mobile bar */}
        <div className="flex-1 p-3 sm:p-6 lg:p-8 max-w-[1920px] w-full mx-auto space-y-6 pb-28 lg:pb-8">
          {children}
        </div>
      </main>
    </div>
  );
}
