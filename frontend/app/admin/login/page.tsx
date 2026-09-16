"use client";

import { Suspense } from "react";
import MemberLoginForm from "@/components/auth/MemberLoginForm";

/**
 * AdminLoginPage
 *
 * Dedicated Admin Portal Login route (/admin/login).
 * Bypasses the MemberLoginVerification screen completely.
 */
export default function AdminLoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-900" />}>
      <MemberLoginForm defaultNext="/admin/dashboard" defaultPortal="admin" />
    </Suspense>
  );
}
