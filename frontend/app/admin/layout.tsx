"use client";

import React from "react";
import AdminPortalLayout from "@/components/admin/layout/AdminPortalLayout";

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return <AdminPortalLayout>{children}</AdminPortalLayout>;
}
