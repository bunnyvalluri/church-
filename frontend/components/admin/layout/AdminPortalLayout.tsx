"use client";

import React, { useState, useEffect } from "react";
import AdminSidebar from "./AdminSidebar";
import AdminHeader from "./AdminHeader";
import AdminFooter from "./AdminFooter";
import { useAuth } from "@/components/providers/AuthProvider";
import { useRouter } from "next/navigation";

export default function AdminPortalLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const { mounted, status, user } = useAuth();
  const router = useRouter();

  // Authentication Guard
  useEffect(() => {
    if (!mounted) return;
    if (status === "unauthenticated") {
      router.replace("/login");
    } else if (
      status === "authenticated" &&
      user &&
      user.role !== "ADMIN" &&
      user.role !== "SUPER_ADMIN"
    ) {
      router.replace("/dashboard");
    }
  }, [mounted, status, user, router]);

  return (
    <div className="min-h-screen bg-slate-100/90 dark:bg-[#070812] text-slate-900 dark:text-gray-100 flex flex-col font-sans antialiased transition-colors duration-200 selection:bg-indigo-500/30 selection:text-indigo-600 dark:selection:text-indigo-300">
      <div className="flex-1 flex w-full relative">
        {/* Shared Enterprise Sidebar */}
        <AdminSidebar
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          isMobileOpen={isMobileSidebarOpen}
          onMobileClose={() => setIsMobileSidebarOpen(false)}
        />

        {/* Right Shell: Header + Content + Footer */}
        <div className="flex-1 flex flex-col min-w-0 overflow-x-hidden bg-slate-100/90 dark:bg-[#070812] transition-colors">
          {/* Top Header */}
          <AdminHeader
            onToggleMobileSidebar={() => setIsMobileSidebarOpen(true)}
          />

          {/* Main Content Area */}
          <main className="flex-1 p-3 sm:p-6 lg:p-8 max-w-[1920px] w-full mx-auto bg-slate-100/90 dark:bg-[#070812] transition-colors">
            {children}
          </main>

          {/* Footer */}
          <AdminFooter />
        </div>
      </div>
    </div>
  );
}
