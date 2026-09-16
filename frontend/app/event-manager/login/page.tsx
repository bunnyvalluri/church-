"use client";

import { Suspense } from "react";
import MemberLoginForm from "@/components/auth/MemberLoginForm";

/**
 * EventManagerLoginPage
 *
 * Dedicated Event Manager Portal Login route (/event-manager/login).
 * Bypasses the MemberLoginVerification screen completely.
 */
export default function EventManagerLoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-900" />}>
      <MemberLoginForm defaultNext="/event-manager" defaultPortal="event-manager" />
    </Suspense>
  );
}
