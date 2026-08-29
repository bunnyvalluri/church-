"use client";

import React, { useState, useEffect } from "react";
import AdminSidebar from "./AdminSidebar";
import AdminHeader from "./AdminHeader";
import AdminFooter from "./AdminFooter";
import { useAuth } from "@/components/providers/AuthProvider";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function AdminPortalLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const { mounted, status, user } = useAuth();
  const router = useRouter();

  // Authentication Guard
  useEffect(() => {
    if (!mounted) return;
    if (status === "unauthenticated") {
      router.replace("/login?next=/admin/dashboard");
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
          <main className="flex-1 p-3 sm:p-6 lg:p-8 max-w-[1920px] w-full mx-auto bg-slate-100/80 dark:bg-[#080914] transition-colors">
            {children}
          </main>

          {/* Footer */}
          <AdminFooter />
        </div>
      </div>
    </div>
  );
}
