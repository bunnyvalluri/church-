"use client";

import { Suspense } from "react";
import MemberLoginVerification from "@/components/auth/MemberLoginVerification";
import MemberLoginForm from "@/components/auth/MemberLoginForm";

/**
 * MemberLoginPage
 *
 * Dedicated entry point for the Member Login flow.
 * Displays the KCM browser readiness verification screen for up to 3 seconds,
 * then seamlessly transitions to the Member Login interface.
 */
export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white" />}>
      <MemberLoginVerification>
        <MemberLoginForm />
      </MemberLoginVerification>
    </Suspense>
  );
}
