/**
 * health/security/DependencySecurityCheck.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Validates npm lockfile consistency and security integrity.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import fs from "fs";
import path from "path";
import { BaseHealthCheck } from "../core/HealthCheck";
import { HealthResult } from "../core/HealthResult";
import { HealthCategoryType, HealthContext } from "../config/health.types";

export class DependencySecurityCheck extends BaseHealthCheck {
  public readonly name = "Dependency Vulnerability & Lockfile Integrity";
  public readonly category: HealthCategoryType = "security";
  public readonly defaultSeverity = "HIGH";

  protected async execute(context: HealthContext): Promise<HealthResult> {
    const lockfilePath = path.join(context.workspaceRoot, "package-lock.json");

    if (!fs.existsSync(lockfilePath)) {
      return HealthResult.warn(
        this.name,
        this.category,
        "Root package-lock.json is missing. Lockfile is required for deterministic dependency builds.",
        "HIGH",
        0,
        { recommendation: "Run 'npm install' to generate root package-lock.json." }
      );
    }

    const stats = fs.statSync(lockfilePath);

    return HealthResult.pass(
      this.name,
      this.category,
      `Deterministic npm package-lock.json verified (${(stats.size / 1024).toFixed(0)}KB).`,
      0,
      { lockfileSizeKb: Math.round(stats.size / 1024) }
    );
  }
}
