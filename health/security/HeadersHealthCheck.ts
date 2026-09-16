/**
 * health/security/HeadersHealthCheck.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Validates HTTP security response headers in Next.js configuration and middleware.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import fs from "fs";
import path from "path";
import { BaseHealthCheck } from "../core/HealthCheck";
import { HealthResult } from "../core/HealthResult";
import { HealthCategoryType, HealthContext } from "../config/health.types";
import { defaultHealthConfig } from "../config/health.config";

export class HeadersHealthCheck extends BaseHealthCheck {
  public readonly name = "HTTP Security Headers & Transport Hardening";
  public readonly category: HealthCategoryType = "security";
  public readonly defaultSeverity = "HIGH";

  protected async execute(context: HealthContext): Promise<HealthResult> {
    const nextConfigPath = path.join(context.frontendPath, "next.config.js");
    const middlewarePath = path.join(context.frontendPath, "middleware.ts");

    let configuredHeaders = "";
    if (fs.existsSync(nextConfigPath)) {
      configuredHeaders += fs.readFileSync(nextConfigPath, "utf-8");
    }
    if (fs.existsSync(middlewarePath)) {
      configuredHeaders += fs.readFileSync(middlewarePath, "utf-8");
    }

    const missingHeaders: string[] = [];
    for (const h of defaultHealthConfig.securityRules.requiredSecurityHeaders) {
      if (!configuredHeaders.includes(h)) {
        missingHeaders.push(h);
      }
    }

    if (missingHeaders.length > 0) {
      return HealthResult.warn(
        this.name,
        this.category,
        `Security headers not explicitly configured in next.config.js/middleware: ${missingHeaders.join(", ")}`,
        "MEDIUM",
        0,
        { missingHeaders, recommendation: "Add headers() in next.config.js to enforce HSTS, X-Frame-Options, and Content-Type-Options." }
      );
    }

    return HealthResult.pass(
      this.name,
      this.category,
      "Security headers verified across Next.js config and edge middleware.",
      0
    );
  }
}
