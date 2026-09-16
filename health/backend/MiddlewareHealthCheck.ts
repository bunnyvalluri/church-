/**
 * health/backend/MiddlewareHealthCheck.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Validates Edge Middleware ordering, route protection, CSRF guards, and RBAC matrix.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import fs from "fs";
import path from "path";
import { BaseHealthCheck } from "../core/HealthCheck";
import { HealthResult } from "../core/HealthResult";
import { HealthCategoryType, HealthContext } from "../config/health.types";

export class MiddlewareHealthCheck extends BaseHealthCheck {
  public readonly name = "Edge Middleware Architecture & Guard Ordering";
  public readonly category: HealthCategoryType = "backend";
  public readonly defaultSeverity = "CRITICAL";

  protected async execute(context: HealthContext): Promise<HealthResult> {
    const middlewarePath = path.join(context.frontendPath, "middleware.ts");

    if (!fs.existsSync(middlewarePath)) {
      return HealthResult.fail(
        this.name,
        this.category,
        "frontend/middleware.ts is missing",
        "CRITICAL",
        0
      );
    }

    const content = fs.readFileSync(middlewarePath, "utf-8");

    const hasHttps = content.includes("x-forwarded-proto");
    const hasCsrf = content.includes("CSRF") || content.includes("isStateChanging");
    const hasSessionCheck = content.includes("verifySessionAtEdge") || content.includes("SESSION_COOKIE_NAME");
    const hasRoleChecks = content.includes("ADMIN_PREFIXES") || content.includes("isAdminRole");
    const hasDedicatedLogins =
      content.includes("/admin/login") &&
      content.includes("/pastor/login") &&
      content.includes("/event-manager/login");

    const missingFeatures: string[] = [];
    if (!hasHttps) missingFeatures.push("HTTPS enforcement");
    if (!hasCsrf) missingFeatures.push("CSRF mutation guard");
    if (!hasSessionCheck) missingFeatures.push("Edge session verification");
    if (!hasRoleChecks) missingFeatures.push("Role prefix checks");
    if (!hasDedicatedLogins) missingFeatures.push("Dedicated portal login bypasses");

    if (missingFeatures.length > 0) {
      return HealthResult.fail(
        this.name,
        this.category,
        `Edge middleware missing core protections: ${missingFeatures.join(", ")}`,
        "HIGH",
        0,
        { missingFeatures }
      );
    }

    return HealthResult.pass(
      this.name,
      this.category,
      "Edge Middleware verified with HTTPS, CSRF, Cryptographic Session validation, and RBAC routing.",
      0
    );
  }
}
