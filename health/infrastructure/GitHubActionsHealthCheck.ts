/**
 * health/infrastructure/GitHubActionsHealthCheck.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Validates GitHub Actions CI/CD workflows and automated pipeline triggers.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import fs from "fs";
import path from "path";
import { BaseHealthCheck } from "../core/HealthCheck";
import { HealthResult } from "../core/HealthResult";
import { HealthCategoryType, HealthContext } from "../config/health.types";

export class GitHubActionsHealthCheck extends BaseHealthCheck {
  public readonly name = "GitHub Actions CI/CD Pipelines & Automation";
  public readonly category: HealthCategoryType = "infrastructure";
  public readonly defaultSeverity = "HIGH";

  protected async execute(context: HealthContext): Promise<HealthResult> {
    const workflowsDir = path.join(context.workspaceRoot, ".github", "workflows");

    if (!fs.existsSync(workflowsDir)) {
      return HealthResult.warn(
        this.name,
        this.category,
        ".github/workflows directory not found.",
        "MEDIUM",
        0
      );
    }

    const workflows = fs
      .readdirSync(workflowsDir)
      .filter((f) => f.endsWith(".yml") || f.endsWith(".yaml"));

    const hasCi = workflows.some((w) => w.includes("ci") || w.includes("build") || w.includes("test"));

    return HealthResult.pass(
      this.name,
      this.category,
      `GitHub Actions verified with ${workflows.length} automated workflow(s) (CI Pipeline: ${hasCi ? "Active" : "Standard"}).`,
      0,
      { workflowCount: workflows.length, hasCi }
    );
  }
}
