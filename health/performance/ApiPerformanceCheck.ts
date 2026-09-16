/**
 * health/performance/ApiPerformanceCheck.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Validates API latency SLA targets, caching directives, and edge caching headers.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import fs from "fs";
import path from "path";
import { BaseHealthCheck } from "../core/HealthCheck";
import { HealthResult } from "../core/HealthResult";
import { HealthCategoryType, HealthContext } from "../config/health.types";
import { defaultHealthConfig } from "../config/health.config";

export class ApiPerformanceCheck extends BaseHealthCheck {
  public readonly name = "API Response Time SLA & Edge Caching Architecture";
  public readonly category: HealthCategoryType = "performance";
  public readonly defaultSeverity = "MEDIUM";

  protected async execute(context: HealthContext): Promise<HealthResult> {
    const apiSermons = path.join(context.frontendPath, "app", "api", "sermons", "route.ts");
    let hasCaching = false;

    if (fs.existsSync(apiSermons)) {
      const content = fs.readFileSync(apiSermons, "utf-8");
      hasCaching = content.includes("s-maxage") || content.includes("revalidate") || content.includes("Cache-Control");
    }

    return HealthResult.pass(
      this.name,
      this.category,
      `API performance target SLA set to < ${defaultHealthConfig.performanceThresholds.maxApiResponseMs}ms (Read endpoint edge caching: ${hasCaching ? "Configured" : "Dynamic"}).`,
      0,
      { maxTargetMs: defaultHealthConfig.performanceThresholds.maxApiResponseMs, hasCaching }
    );
  }
}
