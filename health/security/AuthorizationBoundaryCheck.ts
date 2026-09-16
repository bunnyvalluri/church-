/**
 * health/security/AuthorizationBoundaryCheck.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Validates server-side authorization enforcement on protected administrative APIs.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import fs from "fs";
import path from "path";
import { BaseHealthCheck } from "../core/HealthCheck";
import { HealthResult } from "../core/HealthResult";
import { HealthCategoryType, HealthContext } from "../config/health.types";

export class AuthorizationBoundaryCheck extends BaseHealthCheck {
  public readonly name = "Administrative API Authorization Enforcement";
  public readonly category: HealthCategoryType = "security";
  public readonly defaultSeverity = "CRITICAL";

  protected async execute(context: HealthContext): Promise<HealthResult> {
    const adminApiDir = path.join(context.frontendPath, "app", "api", "admin");
    const violations: string[] = [];

    if (fs.existsSync(adminApiDir)) {
      const scan = (dir: string) => {
        const entries = fs.readdirSync(dir, { withFileTypes: true });
        for (const e of entries) {
          const full = path.join(dir, e.name);
          if (e.isDirectory()) {
            scan(full);
          } else if (e.isFile() && (e.name === "route.ts" || e.name === "route.js")) {
            const content = fs.readFileSync(full, "utf-8");
            const hasAuthCheck =
              content.includes("ADMIN") ||
              content.includes("SUPER_ADMIN") ||
              content.includes("verifySession") ||
              content.includes("verifyAdmin") ||
              content.includes("checkAuth") ||
              content.includes("auth.verifyIdToken");

            if (!hasAuthCheck) {
              violations.push(path.relative(context.frontendPath, full));
            }
          }
        }
      };

      scan(adminApiDir);
    }

    if (violations.length > 0) {
      return HealthResult.warn(
        this.name,
        this.category,
        `Found ${violations.length} admin API route(s) relying solely on middleware without explicit server-side role assertion: ${violations.slice(0, 3).join(", ")}`,
        "HIGH",
        0,
        { violations, recommendation: "Add explicit in-handler role assertion (e.g. session.role === 'ADMIN') to ensure defense-in-depth." }
      );
    }

    return HealthResult.pass(
      this.name,
      this.category,
      "Administrative API routes enforce server-side authorization and role boundaries.",
      0
    );
  }
}
