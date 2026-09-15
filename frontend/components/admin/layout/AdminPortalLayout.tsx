"use client";

import React, { useState, useEffect } from "react";
import AdminSidebar from "./AdminSidebar";
import AdminHeader from "./AdminHeader";
import AdminFooter from "./AdminFooter";
import { useAuth } from "@/components/providers/AuthProvider";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { Loader2, LayoutDashboard, Users, DollarSign, Bug, Settings } from "lucide-react";

export default function AdminPortalLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const { mounted, status, user } = useAuth();
  const router = useRouter();
  const pathname = usePathname() || "/admin/dashboard";

  // Authentication Guard
  useEffect(() => {
    if (!mounted) return;
    if (status === "unauthenticated") {
      const currentPath = typeof window !== "undefined" ? window.location.pathname + window.location.search : "/admin/dashboard";
      router.replace(`/login?next=${encodeURIComponent(currentPath)}`);
    } else if (
      status === "authenticated" &&
      user &&
      user.role !== "ADMIN" &&
      user.role !== "SUPER_ADMIN"
    ) {
      if (user.role === "PASTOR") {
        router.replace("/pastor/main/dashboard");
      } else {
        router.replace("/member");
      }
    }
  }, [mounted, status, user, router]);

  if (!mounted || status === "loading" || status === "unauthenticated" || !user || (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN")) {
    return (
      <div className="h-screen flex items-center justify-center bg-slate-100 dark:bg-[#080914]">
        <div className="text-center space-y-3">
          <Loader2 className="w-10 h-10 animate-spin text-purple-600 dark:text-purple-400 mx-auto" />
          <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Verifying Admin Privileges...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100/80 dark:bg-[#080914] text-slate-900 dark:text-slate-100 flex flex-col font-sans antialiased transition-colors duration-200 selection:bg-indigo-500/30 selection:text-indigo-600 dark:selection:text-indigo-300" suppressHydrationWarning>
      <div className="flex-1 flex w-full relative">
        {/* Shared Enterprise Sidebar */}
        <AdminSidebar
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          isMobileOpen={isMobileSidebarOpen}
          onMobileClose={() => setIsMobileSidebarOpen(false)}
        />

        {/* Right Shell: Header + Content + Footer */}
        <div className="flex-1 flex flex-col min-w-0 overflow-x-hidden bg-slate-100/80 dark:bg-[#080914] transition-colors">
          {/* Top Header */}
          <AdminHeader
            onToggleMobileSidebar={() => setIsMobileSidebarOpen(true)}
          />

          {/* Main Content Area */}
          <main className="flex-1 p-3 sm:p-6 lg:p-8 pb-24 lg:pb-8 max-w-[1920px] w-full mx-auto bg-slate-100/80 dark:bg-[#080914] transition-colors">
            {children}
          </main>

          {/* Footer */}
          <AdminFooter />
        </div>
      </div>

      {/* Mobile Ultra-Premium Floating Glassmorphic Bottom Dock for Admin */}
      <div className="lg:hidden fixed bottom-3 left-3 right-3 z-50 pointer-events-auto">
        <nav className="bg-white/90 dark:bg-[#0A0B1E]/90 backdrop-blur-2xl border border-slate-200/80 dark:border-white/[0.12] rounded-3xl p-1.5 shadow-[0_8px_32px_rgba(0,0,0,0.18)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.5)] flex items-center justify-around gap-1 transition-all duration-300">
          {[
            { name: "DASHBOARD", href: "/admin/dashboard", icon: LayoutDashboard, color: "text-indigo-600 dark:text-indigo-400" },
            { name: "MEMBERS", href: "/admin/members", icon: Users, color: "text-emerald-600 dark:text-emerald-400" },
            { name: "FINANCE", href: "/admin/finance", icon: DollarSign, color: "text-amber-600 dark:text-amber-400" },
            { name: "REPORTS", href: "/admin/support/reports", icon: Bug, color: "text-rose-600 dark:text-rose-400" },
            { name: "SETTINGS", href: "/admin/settings", icon: Settings, color: "text-cyan-600 dark:text-cyan-400" },
          ].map((item) => {
            const isActive = pathname === item.href || (item.href !== "/admin/dashboard" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`relative flex-1 flex flex-col items-center justify-center py-2 px-1 rounded-2xl transition-all duration-200 active:scale-90 ${
                  isActive
                    ? "bg-slate-100/80 dark:bg-white/[0.08] shadow-sm"
                    : "hover:bg-slate-50 dark:hover:bg-white/[0.03]"
                }`}
              >
                {isActive && (
                  <span className="absolute -top-1.5 w-6 h-1 rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 shadow-sm shadow-indigo-500/50" />
                )}

                <div className="relative flex items-center justify-center">
                  <item.icon
                    className={`w-5 h-5 transition-all duration-200 ${
                      isActive
                        ? `${item.color} scale-110 -translate-y-0.5`
                        : "text-slate-400 dark:text-gray-400"
                    }`}
                  />
                  {isActive && (
                    <span className="absolute -bottom-0.5 w-1 h-1 rounded-full bg-indigo-500 dark:bg-indigo-400 animate-pulse" />
                  )}
                </div>

                <span
                  className={`text-[9px] font-black uppercase tracking-wider mt-1 transition-colors duration-200 text-center leading-none ${
                    isActive
                      ? `${item.color} font-extrabold`
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
    </div>
  );
}
