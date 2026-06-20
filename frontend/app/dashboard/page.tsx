"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/providers/AuthProvider";

/**
 * /dashboard — Smart portal router for authenticated users.
 *
 * Role → Redirect:
 *  SUPER_ADMIN → /portal-select  (can choose Admin or Pastor portal)
 *  ADMIN       → /admin
 *  PASTOR      → /pastor
 *  MEMBER      → /member
 *  Unauthenticated → /login
 */
export default function DashboardPage() {
  const router = useRouter();
  const { user, status, mounted } = useAuth();

  useEffect(() => {
    if (!mounted) return;

    if (status === "unauthenticated") {
      router.replace("/login");
      return;
    }

    if (status === "authenticated" && user) {
      switch (user.role) {
        case "SUPER_ADMIN":
          router.replace("/portal-select");
          break;
        case "ADMIN":
          router.replace("/admin");
          break;
        case "PASTOR":
          router.replace("/pastor");
          break;
        default:
          router.replace("/member");
      }
    }
  }, [mounted, status, user, router]);

  // Render nothing until auth is confirmed (no flash)
  if (!mounted || status === "unauthenticated" || status === "loading") {
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-white to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950">
      <div className="text-center space-y-4">
        <div className="relative w-16 h-16 mx-auto">
          <div className="absolute inset-0 rounded-full bg-purple-500/20 animate-ping" />
          <div className="w-16 h-16 rounded-full border-4 border-purple-500/10 border-t-purple-600 animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center text-2xl">🙏</div>
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
          Routing to your portal...
        </p>
      </div>
    </div>
  );
}
