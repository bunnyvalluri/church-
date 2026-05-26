"use client";

import { useAuth } from "@/components/providers/AuthProvider";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Loader2, ShieldAlert } from "lucide-react";

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

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-50 dark:from-gray-955 dark:via-gray-900 dark:to-indigo-955" />
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-white to-indigo-50 dark:from-gray-950 dark:via-gray-900 dark:to-indigo-950">
      <div className="text-center p-8 bg-white/40 dark:bg-black/20 backdrop-blur-md rounded-3xl border border-white/20 dark:border-white/5 max-w-sm w-full shadow-2xl">
        <div className="relative w-16 h-16 mx-auto mb-6">
          <Loader2 className="w-16 h-16 text-purple-600 dark:text-purple-400 animate-spin stroke-[2.5]" />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="w-2.5 h-2.5 bg-purple-500 rounded-full animate-ping" />
          </div>
        </div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
          Identifying Portal
        </h2>
        <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">
          Retrieving your church membership credentials and routing to your secure dashboard...
        </p>
      </div>
    </div>
  );
}
