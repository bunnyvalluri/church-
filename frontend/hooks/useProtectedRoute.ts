"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/providers/AuthProvider";

type AllowedRole = "MEMBER" | "PASTOR" | "ADMIN" | "SUPER_ADMIN" | "EVENT_MANAGER" | "FIELD_VOLUNTEER" | "NGO_ADMIN";

interface UseProtectedRouteOptions {
  /** Roles that are allowed to access this page. Empty = any authenticated user. */
  allowedRoles?: AllowedRole[];
  /** Where to redirect if not authenticated. Default: "/" (homepage) */
  redirectTo?: string;
}

/**
 * useProtectedRoute — Security hook to block unauthenticated or unauthorized users.
 *
 * Usage:
 *   const { user, isAuthorized } = useProtectedRoute({ allowedRoles: ["ADMIN", "SUPER_ADMIN"] });
 *   if (!isAuthorized) return null; // renders nothing until auth check completes
 */
export function useProtectedRoute({
  allowedRoles = [],
  redirectTo = "/",
}: UseProtectedRouteOptions = {}) {
  const router = useRouter();
  const { user, status, mounted } = useAuth();

  useEffect(() => {
    if (!mounted) return;

    // Not logged in → redirect to homepage (hidden from public)
    if (status === "unauthenticated") {
      router.replace(redirectTo);
      return;
    }

    // Logged in but wrong role → redirect to their correct portal
    if (status === "authenticated" && user && allowedRoles.length > 0) {
      if (!allowedRoles.includes(user.role)) {
        // Route to their correct portal instead
        if (user.role === "PASTOR") router.replace("/pastor");
        else if (user.role === "ADMIN" || user.role === "SUPER_ADMIN") router.replace("/admin");
        else router.replace("/member");
      }
    }
  }, [mounted, status, user, router, allowedRoles, redirectTo]);

  const isAuthorized =
    mounted &&
    status === "authenticated" &&
    user !== null &&
    (allowedRoles.length === 0 || allowedRoles.includes(user.role));

  return { user, status, mounted, isAuthorized };
}
