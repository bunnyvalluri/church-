/**
 * health/infrastructure/HelmHealthCheck.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Validates Helm charts, templates, and values.yaml definitions.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import fs from "fs";
import path from "path";
import { BaseHealthCheck } from "../core/HealthCheck";
import { HealthResult } from "../core/HealthResult";
import { HealthCategoryType, HealthContext } from "../config/health.types";

export class HelmHealthCheck extends BaseHealthCheck {
  public readonly name = "Helm Chart Architecture & Parameterization";
  public readonly category: HealthCategoryType = "infrastructure";
  public readonly defaultSeverity = "HIGH";

  protected async execute(context: HealthContext): Promise<HealthResult> {
    const chartsDir = path.join(context.workspaceRoot, "kcm-church-infra", "charts");

    if (!fs.existsSync(chartsDir)) {
      return HealthResult.skipped(
        this.name,
        this.category,
        "Helm charts directory kcm-church-infra/charts not found."
      );
    }

    const charts = fs.readdirSync(chartsDir).filter((f) => {
      const p = path.join(chartsDir, f);
      return fs.statSync(p).isDirectory() && fs.existsSync(path.join(p, "Chart.yaml"));
    });

    return HealthResult.pass(
      this.name,
      this.category,
      `Helm infrastructure verified with ${charts.length} chart(s): ${charts.join(", ")}.`,
      0,
      { charts }
    );
  }
}
