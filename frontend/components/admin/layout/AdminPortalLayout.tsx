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
      {!isMobileSidebarOpen && (
        <div className="lg:hidden fixed bottom-2.5 sm:bottom-4 inset-x-2.5 sm:inset-x-auto sm:left-1/2 sm:-translate-x-1/2 sm:w-[440px] z-40 pointer-events-auto select-none">
          <nav className="bg-white/95 dark:bg-[#0c0e1a]/95 backdrop-blur-2xl border border-slate-200/90 dark:border-white/[0.12] rounded-2xl p-1 shadow-[0_10px_30px_-5px_rgba(0,0,0,0.12),0_0_0_1px_rgba(0,0,0,0.04)] dark:shadow-[0_12px_36px_-6px_rgba(0,0,0,0.7),0_0_0_1px_rgba(255,255,255,0.06)] flex items-center justify-around gap-1 transition-all duration-200">
            {[
              { name: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard, color: "text-indigo-600 dark:text-indigo-400" },
              { name: "Members", href: "/admin/members", icon: Users, color: "text-emerald-600 dark:text-emerald-400" },
              { name: "Finance", href: "/admin/finance", icon: DollarSign, color: "text-amber-600 dark:text-amber-400" },
              { name: "Reports", href: "/admin/support/reports", icon: Bug, color: "text-rose-600 dark:text-rose-400" },
              { name: "Settings", href: "/admin/settings", icon: Settings, color: "text-cyan-600 dark:text-cyan-400" },
            ].map((item) => {
              const isActive = pathname === item.href || (item.href !== "/admin/dashboard" && pathname.startsWith(item.href));
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
    </div>
  );
}
