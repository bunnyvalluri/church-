"use client";

import React, { useEffect } from "react";

export interface MemberLoginVerificationProps {
  /** Maximum duration in milliseconds before proceeding to login (default: 3000ms) */
  duration?: number;
  /** Callback fired exactly once when verification completes or times out */
  onComplete?: () => void;
  /** Child content to render upon verification completion (e.g. MemberLoginForm) */
  children?: React.ReactNode;
}

/**
 * MemberLoginVerification
 *
 * Deprecated / bypassed: Immediately renders children with zero delay.
 */
export default function MemberLoginVerification({
  onComplete,
  children,
}: MemberLoginVerificationProps) {
  useEffect(() => {
    onComplete?.();
  }, [onComplete]);

  return children ? <>{children}</> : null;
}
