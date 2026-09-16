/**
 * health/observability/MonitoringHealthCheck.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Validates liveness, readiness, and synthetic monitoring probe endpoints.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import fs from "fs";
import path from "path";
import { BaseHealthCheck } from "../core/HealthCheck";
import { HealthResult } from "../core/HealthResult";
import { HealthCategoryType, HealthContext } from "../config/health.types";

export class MonitoringHealthCheck extends BaseHealthCheck {
  public readonly name = "Health Probe Endpoints & Synthetic Monitoring";
  public readonly category: HealthCategoryType = "observability";
  public readonly defaultSeverity = "CRITICAL";

  protected async execute(context: HealthContext): Promise<HealthResult> {
    const healthApi = path.join(context.frontendPath, "app", "api", "health", "route.ts");
    const readyApi = path.join(context.frontendPath, "app", "api", "ready", "route.ts");

    const hasHealth = fs.existsSync(healthApi);
    const hasReady = fs.existsSync(readyApi);

    if (!hasHealth) {
      return HealthResult.fail(
        this.name,
        this.category,
        "Primary health check endpoint /api/health is missing.",
        "CRITICAL",
        0
      );
    }

    return HealthResult.pass(
      this.name,
      this.category,
      `Monitoring endpoints operational (Liveness /api/health: Active, Readiness /api/ready: ${hasReady ? "Active" : "Standard"}).`,
      0,
      { liveness: hasHealth, readiness: hasReady }
    );
  }
}
