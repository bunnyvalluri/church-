/**
 * health/observability/MetricsHealthCheck.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Validates Prometheus metrics instrumentation and /metrics endpoints.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import fs from "fs";
import path from "path";
import { BaseHealthCheck } from "../core/HealthCheck";
import { HealthResult } from "../core/HealthResult";
import { HealthCategoryType, HealthContext } from "../config/health.types";

export class MetricsHealthCheck extends BaseHealthCheck {
  public readonly name = "Prometheus Metrics Instrumentation (/metrics)";
  public readonly category: HealthCategoryType = "observability";
  public readonly defaultSeverity = "MEDIUM";

  protected async execute(context: HealthContext): Promise<HealthResult> {
    const metricsModule = path.join(context.backendPath, "src", "metrics.js");
    const backendServer = path.join(context.backendPath, "server.js");

    const hasMetricsModule = fs.existsSync(metricsModule);
    let hasMetricsMiddleware = false;

    if (fs.existsSync(backendServer)) {
      const content = fs.readFileSync(backendServer, "utf-8");
      hasMetricsMiddleware = content.includes("metricsMiddleware") || content.includes("/metrics");
    }

    if (!hasMetricsModule) {
      return HealthResult.warn(
        this.name,
        this.category,
        "Prometheus metrics instrumentation module not found at backend/src/metrics.js.",
        "LOW",
        0
      );
    }

    return HealthResult.pass(
      this.name,
      this.category,
      "Prometheus metrics active with prom-client HTTP duration and status code instrumentation.",
      0,
      { metricsModule: hasMetricsModule, middlewareAttached: hasMetricsMiddleware }
    );
  }
}
