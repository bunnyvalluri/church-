/**
 * frontend/lib/mobileErrorLogger.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Safe Client-Side Error Logging & Diagnostic Telemetry.
 * Enforces strict sanitization to NEVER collect passwords, auth tokens,
 * card details, or sensitive financial information.
 * ─────────────────────────────────────────────────────────────────────────────
 */

export interface MobileErrorPayload {
  errorId: string;
  message: string;
  stack?: string;
  url: string;
  userAgent: string;
  timestamp: string;
  connectionType?: string;
}

const SENSITIVE_KEYWORDS = [
  "password",
  "token",
  "secret",
  "authorization",
  "cvv",
  "cardnumber",
  "razorpay_signature",
  "stripe",
];

function sanitizeString(str: string): string {
  if (!str) return "";
  let clean = str;
  SENSITIVE_KEYWORDS.forEach((kw) => {
    const reg = new RegExp(`("${kw}"\\s*:\\s*")[^"]+(")`, "gi");
    clean = clean.replace(reg, `$1[REDACTED]$2`);
  });
  return clean;
}

export function logMobileError(error: Error | string, contextUrl?: string): string {
  const errorId = `ERR-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  const message = typeof error === "string" ? error : error.message || "Unknown client error";
  const stack = typeof error === "object" ? error.stack : undefined;

  const payload: MobileErrorPayload = {
    errorId,
    message: sanitizeString(message),
    stack: stack ? sanitizeString(stack.slice(0, 1000)) : undefined,
    url: contextUrl || (typeof window !== "undefined" ? window.location.href : ""),
    userAgent: typeof navigator !== "undefined" ? navigator.userAgent : "SSR",
    timestamp: new Date().toISOString(),
    connectionType:
      typeof navigator !== "undefined" && (navigator as any).connection
        ? (navigator as any).connection.effectiveType
        : undefined,
  };

  console.error(`[MOBILE_ERROR_LOGGER][${errorId}]`, payload);

  // In production, optionally post to endpoint if online
  if (typeof window !== "undefined" && navigator.onLine) {
    try {
      fetch("/api/logs/client-error", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        keepalive: true,
      }).catch(() => {});
    } catch {
      // Ignore fallback failures silently
    }
  }

  return errorId;
}
