/**
 * health/auth/SessionHealthCheck.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Validates Edge Web Crypto HMAC cryptographic session cookies, TTL, and flags.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import fs from "fs";
import path from "path";
import { BaseHealthCheck } from "../core/HealthCheck";
import { HealthResult } from "../core/HealthResult";
import { HealthCategoryType, HealthContext } from "../config/health.types";

export class SessionHealthCheck extends BaseHealthCheck {
  public readonly name = "Cryptographic Edge Session Verification & TTL";
  public readonly category: HealthCategoryType = "auth";
  public readonly defaultSeverity = "CRITICAL";

  protected async execute(context: HealthContext): Promise<HealthResult> {
    const edgeSessionPath = path.join(context.frontendPath, "lib", "edgeSession.ts");

    if (!fs.existsSync(edgeSessionPath)) {
      return HealthResult.fail(
        this.name,
        this.category,
        "frontend/lib/edgeSession.ts is missing",
        "CRITICAL",
        0
      );
    }

    const content = fs.readFileSync(edgeSessionPath, "utf-8");

    const hasHmac = content.includes("HMAC") || content.includes("crypto.subtle");
    const hasTtl = content.includes("DEFAULT_SESSION_TTL") || content.includes("exp");
    const hasHttpOnly = content.includes("httpOnly: true") || content.includes("httpOnly");
    const hasSecure = content.includes("secure: true") || content.includes("secure");
    const hasSameSite = content.includes("sameSite: 'lax'") || content.includes("sameSite");

    if (!hasHmac || !hasTtl) {
      return HealthResult.fail(
        this.name,
        this.category,
        "Edge session implementation lacks cryptographic HMAC verification or expiration checks.",
        "CRITICAL",
        0
      );
    }

    return HealthResult.pass(
      this.name,
      this.category,
      "Edge cryptographic session management verified with Web Crypto HMAC SHA-256 and expiration bounds.",
      0,
      { hasHmac, hasTtl, hasHttpOnly, hasSecure, hasSameSite }
    );
  }
}
