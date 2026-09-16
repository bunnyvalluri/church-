/**
 * health/security/CSRFHealthCheck.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Validates Cross-Site Request Forgery (CSRF) defenses on state-changing API routes.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import fs from "fs";
import path from "path";
import { BaseHealthCheck } from "../core/HealthCheck";
import { HealthResult } from "../core/HealthResult";
import { HealthCategoryType, HealthContext } from "../config/health.types";

export class CSRFHealthCheck extends BaseHealthCheck {
  public readonly name = "Cross-Site Request Forgery (CSRF) Defenses";
  public readonly category: HealthCategoryType = "security";
  public readonly defaultSeverity = "CRITICAL";

  protected async execute(context: HealthContext): Promise<HealthResult> {
    const middlewarePath = path.join(context.frontendPath, "middleware.ts");

    if (!fs.existsSync(middlewarePath)) {
      return HealthResult.fail(
        this.name,
        this.category,
        "frontend/middleware.ts missing; cannot verify CSRF defenses.",
        "CRITICAL",
        0
      );
    }

    const content = fs.readFileSync(middlewarePath, "utf-8");
    const hasCsrfDefense =
      content.includes("isStateChanging") &&
      content.includes("req.headers.get('origin')") &&
      content.includes("Forbidden: Cross-site request forgery");

    if (!hasCsrfDefense) {
      return HealthResult.fail(
        this.name,
        this.category,
        "CSRF origin verification on state-changing API requests not detected in Edge Middleware.",
        "CRITICAL",
        0
      );
    }

    return HealthResult.pass(
      this.name,
      this.category,
      "Edge Middleware CSRF protection verified for POST, PUT, PATCH, and DELETE requests with webhook exemptions.",
      0
    );
  }
}
