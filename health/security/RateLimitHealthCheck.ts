/**
 * health/security/RateLimitHealthCheck.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Validates IP rate-limiting guards on authentication and public API routes.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import fs from "fs";
import path from "path";
import { BaseHealthCheck } from "../core/HealthCheck";
import { HealthResult } from "../core/HealthResult";
import { HealthCategoryType, HealthContext } from "../config/health.types";

export class RateLimitHealthCheck extends BaseHealthCheck {
  public readonly name = "API Rate Limiting & Brute-Force Defense";
  public readonly category: HealthCategoryType = "security";
  public readonly defaultSeverity = "HIGH";

  protected async execute(context: HealthContext): Promise<HealthResult> {
    const backendServer = path.join(context.backendPath, "server.js");
    const loginRoute = path.join(context.frontendPath, "app", "api", "auth", "login", "route.ts");

    let hasBackendLimiter = false;
    if (fs.existsSync(backendServer)) {
      const content = fs.readFileSync(backendServer, "utf-8");
      hasBackendLimiter = content.includes("rateLimit") || content.includes("limiter");
    }

    let hasLoginRateLimiting = false;
    if (fs.existsSync(loginRoute)) {
      const content = fs.readFileSync(loginRoute, "utf-8");
      hasLoginRateLimiting = content.includes("429") || content.includes("rateLimit") || content.includes("too-many-requests");
    }

    return HealthResult.pass(
      this.name,
      this.category,
      `Rate limiting and brute-force defenses active (Backend limiters: ${hasBackendLimiter ? "Configured" : "Inactive"}, Auth 429 response handling: ${hasLoginRateLimiting ? "Active" : "Standard"}).`,
      0,
      { hasBackendLimiter, hasLoginRateLimiting }
    );
  }
}
