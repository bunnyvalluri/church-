"use client";

import React from "react";
import { usePathname } from "next/navigation";
import AdminPortalLayout from "@/components/admin/layout/AdminPortalLayout";

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() || "";

  // Bypass the enterprise dashboard shell for full-screen authentication pages
  const isAuthPage =
    pathname.startsWith("/admin/login") || pathname.startsWith("/admin/register");

  if (isAuthPage) {
    return <>{children}</>;
  }

  return <AdminPortalLayout>{children}</AdminPortalLayout>;
}
