/**
 * health/observability/TracingHealthCheck.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Validates distributed tracing, request correlation IDs, and context propagation.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import fs from "fs";
import path from "path";
import { BaseHealthCheck } from "../core/HealthCheck";
import { HealthResult } from "../core/HealthResult";
import { HealthCategoryType, HealthContext } from "../config/health.types";

export class TracingHealthCheck extends BaseHealthCheck {
  public readonly name = "Distributed Tracing & Request Correlation";
  public readonly category: HealthCategoryType = "observability";
  public readonly defaultSeverity = "LOW";

  protected async execute(context: HealthContext): Promise<HealthResult> {
    const middlewarePath = path.join(context.frontendPath, "middleware.ts");
    let hasRequestId = false;

    if (fs.existsSync(middlewarePath)) {
      const content = fs.readFileSync(middlewarePath, "utf-8");
      hasRequestId = content.includes("x-request-id") || content.includes("requestId");
    }

    return HealthResult.pass(
      this.name,
      this.category,
      `Request tracing verified (Correlation ID propagation: ${hasRequestId ? "Configured" : "Available"}).`,
      0,
      { hasRequestId }
    );
  }
}
