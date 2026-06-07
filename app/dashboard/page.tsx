"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/providers/AuthProvider";

export default function DashboardRedirector() {
  const router = useRouter();
  const { user, status, mounted } = useAuth();

  useEffect(() => {
    if (!mounted) return;

    if (status === "unauthenticated") {
      router.replace("/login");
    } else if (status === "authenticated" && user) {
      const { role } = user;
      if (role === "PASTOR") {
        router.replace("/pastor");
      } else if (role === "ADMIN" || role === "SUPER_ADMIN") {
        router.replace("/admin");
      } else {
        router.replace("/member");
      }
    }
  }, [mounted, status, user, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-white to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950 transition-colors duration-500 relative overflow-hidden">
      {/* Decorative background glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none animate-pulse" />

      {/* Cross watermark */}
      <div className="absolute inset-0 flex items-center justify-center opacity-[0.02] dark:opacity-[0.015] select-none pointer-events-none">
        <span className="text-[#0F172A] dark:text-white font-bold" style={{ fontSize: "35rem", lineHeight: 1 }}>✝</span>
      </div>

      <div className="text-center space-y-6 z-10 p-6">
        <div className="relative w-20 h-20 mx-auto">
          {/* Pulsing ring outer */}
          <div className="absolute inset-0 rounded-full bg-purple-500/20 dark:bg-purple-500/10 animate-ping duration-1000" />
          {/* Main spin loader */}
          <div className="w-20 h-20 rounded-full border-4 border-purple-500/10 border-t-purple-600 dark:border-purple-500/20 dark:border-t-purple-500 animate-spin" />
          {/* Inner cross icon */}
          <div className="absolute inset-0 flex items-center justify-center text-purple-600 dark:text-purple-400 font-extrabold text-2xl">
            ✝
          </div>
        </div>
        
        <div className="space-y-2">
          <h2 className="text-sm font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest animate-pulse">
            Grace Community Church
          </h2>
          <p className="text-gray-600 dark:text-gray-300 text-xs font-semibold leading-relaxed">
            Routing to your fellowship space...
          </p>
        </div>
      </div>
    </div>
  );
}
