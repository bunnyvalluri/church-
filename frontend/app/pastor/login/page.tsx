"use client";

import { Suspense } from "react";
import MemberLoginForm from "@/components/auth/MemberLoginForm";

/**
 * PastorLoginPage
 *
 * Dedicated Pastor Portal Login route (/pastor/login).
 * Bypasses the MemberLoginVerification screen completely.
 */
export default function PastorLoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-900" />}>
      <MemberLoginForm defaultNext="/pastor/main/dashboard" defaultPortal="pastor" />
    </Suspense>
  );
}
