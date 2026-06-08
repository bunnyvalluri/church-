"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/providers/AuthProvider";

export default function DashboardPage() {
  const router = useRouter();
  const { user, status, mounted } = useAuth();

  useEffect(() => {
    if (!mounted) return;

    // Not logged in → send to homepage (hidden from unauthenticated users)
    if (status === "unauthenticated") {
      router.replace("/");
      return;
    }

    // Logged-in users → route to their role-specific page
    if (status === "authenticated" && user) {
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

  // Show nothing while checking auth — no flash of content for unauthenticated users
  if (!mounted || status === "unauthenticated") return null;

  // Minimal loading screen only shown to authenticated users while routing
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-white to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950">
      <div className="text-center space-y-6">
        <div className="relative w-16 h-16 mx-auto">
          <div className="absolute inset-0 rounded-full bg-purple-500/20 animate-ping" />
          <div className="w-16 h-16 rounded-full border-4 border-purple-500/10 border-t-purple-600 animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center text-purple-600 dark:text-purple-400 font-bold text-xl">
            ✝
          </div>
        </div>
        <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">
          Routing to your portal...
        </p>
      </div>
    </div>
  );
}
