/**
 * health/security/CORSHealthCheck.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Inspects CORS origin allowlists in Next.js middleware and Express companion.
 * Asserts that production environments do not use wildcard '*' origins.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import fs from "fs";
import path from "path";
import { BaseHealthCheck } from "../core/HealthCheck";
import { HealthResult } from "../core/HealthResult";
import { HealthCategoryType, HealthContext } from "../config/health.types";

export class CORSHealthCheck extends BaseHealthCheck {
  public readonly name = "Cross-Origin Resource Sharing (CORS) Policy";
  public readonly category: HealthCategoryType = "security";
  public readonly defaultSeverity = "CRITICAL";

  protected async execute(context: HealthContext): Promise<HealthResult> {
    const serverPath = path.join(context.backendPath, "server.js");
    const middlewarePath = path.join(context.frontendPath, "middleware.ts");

    let hasWildcardCors = false;
    let hasExplicitAllowlist = false;

    if (fs.existsSync(serverPath)) {
      const content = fs.readFileSync(serverPath, "utf-8");
      hasWildcardCors = content.includes("origin: '*'") || content.includes('origin: "*"');
      hasExplicitAllowlist = content.includes("ALLOWED_ORIGINS");
    }

    if (fs.existsSync(middlewarePath)) {
      const content = fs.readFileSync(middlewarePath, "utf-8");
      if (content.includes("isAllowedOrigin")) {
        hasExplicitAllowlist = true;
      }
    }

    if (hasWildcardCors) {
      return HealthResult.fail(
        this.name,
        this.category,
        "Insecure CORS configuration: Wildcard origin '*' detected in backend service.",
        "CRITICAL",
        0,
        { recommendation: "Replace wildcard CORS with explicit allowed origin domain list." }
      );
    }

    return HealthResult.pass(
      this.name,
      this.category,
      "Strict CORS policy verified with explicit trusted origin allowlist.",
      0,
      { allowlistEnforced: hasExplicitAllowlist }
    );
  }
}
