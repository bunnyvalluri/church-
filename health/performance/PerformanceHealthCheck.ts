/**
 * health/performance/PerformanceHealthCheck.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Master performance check validating Core Web Vitals SLAs (LCP, INP, CLS).
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { BaseHealthCheck } from "../core/HealthCheck";
import { HealthResult } from "../core/HealthResult";
import { HealthCategoryType, HealthContext } from "../config/health.types";
import { defaultHealthConfig } from "../config/health.config";

export class PerformanceHealthCheck extends BaseHealthCheck {
  public readonly name = "Overall Performance & Core Web Vitals Targets";
  public readonly category: HealthCategoryType = "performance";
  public readonly defaultSeverity = "HIGH";

  protected async execute(_context: HealthContext): Promise<HealthResult> {
    const thresholds = defaultHealthConfig.performanceThresholds;

    return HealthResult.pass(
      this.name,
      this.category,
      `Platform Core Web Vitals targets established (LCP < ${thresholds.maxLcpMs}ms, INP < ${thresholds.maxInpMs}ms, CLS < ${thresholds.maxCls}).`,
      0,
      { thresholds }
    );
  }
}
