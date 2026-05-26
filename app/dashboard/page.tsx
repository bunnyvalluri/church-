"use client";

import { useAuth } from "@/components/providers/AuthProvider";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function DashboardPage() {
  const { user, status, mounted } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!mounted) return;

    if (status === "unauthenticated") {
      router.replace("/login");
    } else if (status === "authenticated" && user) {
      // Direct users dynamically depending on their synced database role
      const userRole = user.role;
      if (userRole === "ADMIN") {
        router.replace("/admin");
      } else if (userRole === "PASTOR") {
        router.replace("/pastor");
      } else {
        router.replace("/member");
      }
    }
  }, [mounted, status, user, router]);

  // Keep identical layout and classnames during server-side render & first mount to prevent hydration mismatch!
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-white to-indigo-50 dark:from-gray-950 dark:via-gray-900 dark:to-indigo-950 transition-colors duration-500">
      <div className="relative p-10 bg-white/60 dark:bg-gray-900/40 backdrop-blur-2xl rounded-3xl border border-white/40 dark:border-white/10 max-w-md w-full shadow-2xl shadow-indigo-500/5 dark:shadow-none text-center space-y-6 overflow-hidden">
        {/* Animated glow background inside the card */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Central Premium Loading Icon */}
        <div className="relative w-20 h-20 mx-auto">
          {/* External rotating border */}
          <div className="absolute inset-0 rounded-full border-4 border-purple-500/10 border-t-purple-600 dark:border-purple-500/20 dark:border-t-purple-400 animate-spin" />
          
          {/* Pulsing inner glow circle */}
          <div className="absolute inset-2.5 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-600 dark:from-purple-500 dark:to-indigo-500 opacity-20 animate-ping" />
          
          {/* Inner static branding symbol */}
          <div className="absolute inset-2.5 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-600 dark:from-purple-500 dark:to-indigo-500 flex items-center justify-center text-white text-lg font-bold shadow-lg shadow-purple-500/20">
            ✝
          </div>
        </div>

        {/* Text Details */}
        <div className="space-y-2 relative z-10">
          <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white tracking-tight">
            Securing Connection
          </h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">
            Verifying your platform role and connecting you to your secure church fellowship portal...
          </p>
        </div>

        {/* Subtle footer */}
        <div className="pt-2 text-[10px] font-bold uppercase tracking-widest text-purple-600/50 dark:text-purple-400/50 relative z-10 animate-pulse">
          Kingdom of Christ Ministries
        </div>
      </div>
    </div>
  );
}
