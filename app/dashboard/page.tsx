"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/providers/AuthProvider";

/**
 * /dashboard — Smart portal router for authenticated users only.
 *
 * Security:
 *  - Unauthenticated visitors → instantly redirected to homepage (nothing shown)
 *  - Authenticated MEMBER     → redirected to /member
 *  - Authenticated PASTOR     → redirected to /pastor
 *  - Authenticated ADMIN      → redirected to /admin
 *
 * The page renders NOTHING (returns null) until auth is confirmed,
 * so no content ever flashes to unauthenticated users.
 */
export default function DashboardPage() {
  const router = useRouter();
  const { user, status, mounted } = useAuth();

  useEffect(() => {
    if (!mounted) return;

    // ❌ Not logged in → send to login page, page stays invisible
    if (status === "unauthenticated") {
      router.replace("/login");
      return;
    }

    // ✅ Logged in → route to role-specific portal
    if (status === "authenticated" && user) {
      if (user.role === "PASTOR") {
        router.replace("/pastor");
      } else if (user.role === "ADMIN" || user.role === "SUPER_ADMIN") {
        router.replace("/admin");
      } else {
        router.replace("/member");
      }
    }
  }, [mounted, status, user, router]);

  // ── Security: render NOTHING until auth state is known ──────────────────
  // This ensures no content, no flash, no page structure is visible
  // to anyone who is not authenticated.
  if (!mounted || status === "unauthenticated" || status === "loading") {
    return null;
  }

  // Only authenticated users reach here — show a brief routing spinner
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-white to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950">
      <div className="text-center space-y-4">
        <div className="relative w-16 h-16 mx-auto">
          <div className="absolute inset-0 rounded-full bg-purple-500/20 animate-ping" />
          <div className="w-16 h-16 rounded-full border-4 border-purple-500/10 border-t-purple-600 animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center text-purple-600 dark:text-purple-400 font-bold text-xl">
            ✝
          </div>
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
          Routing to your portal...
        </p>
      </div>
    </div>
  );
}
