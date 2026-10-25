"use client";

import { Suspense } from "react";
import MemberLoginForm from "@/components/auth/MemberLoginForm";

/**
 * MemberLoginPage
 *
 * Dedicated entry point for the Member Login flow.
 * Directly renders the Member Login interface with immediate access.
 */
export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white" />}>
      <MemberLoginForm />
    </Suspense>
  );
}
