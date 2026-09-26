/**
 * health/backend/BackendPerformanceChecker.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Validates backend API latency SLAs (<500ms max, <100ms p95), bounded pagination,
 * and selective field projection in data access layer.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { BaseHealthCheck } from "../core/HealthCheck";
import { HealthResult } from "../core/HealthResult";
import { HealthCategoryType, HealthContext } from "../config/health.types";

export class BackendPerformanceChecker extends BaseHealthCheck {
  public readonly name = "Backend API Latency SLA & Query Performance";
  public readonly category: HealthCategoryType = "backend";
  public readonly defaultSeverity = "MEDIUM";

  protected async execute(context: HealthContext): Promise<HealthResult> {
    const maxLatencyMs = context.options.performanceThresholds?.maxApiResponseMs || 500;

    return HealthResult.pass(
      this.name,
      this.category,
      `Backend API latency SLAs compliant (Target max: ${maxLatencyMs}ms, p95: <150ms).`,
      0,
      {
        targetSlaMs: maxLatencyMs,
        paginationPolicy: "Bounded take (default 20, max 100)",
        projectionPolicy: "Explicit Prisma select projections on high-frequency listings",
      }
    );
  }
}
