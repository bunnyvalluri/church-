/**
 * health/frontend/BuildHealthCheck.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Inspects production build artifacts in frontend/.next.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import fs from "fs";
import path from "path";
import { BaseHealthCheck } from "../core/HealthCheck";
import { HealthResult } from "../core/HealthResult";
import { HealthCategoryType, HealthContext } from "../config/health.types";

export class BuildHealthCheck extends BaseHealthCheck {
  public readonly name = "Next.js Production Build Artifacts";
  public readonly category: HealthCategoryType = "frontend";
  public readonly defaultSeverity = "HIGH";

  protected async execute(context: HealthContext): Promise<HealthResult> {
    const dotNextDir = path.join(context.frontendPath, ".next");
    const buildIdPath = path.join(dotNextDir, "BUILD_ID");
    const staticDir = path.join(dotNextDir, "static");
    const serverDir = path.join(dotNextDir, "server");

    if (!fs.existsSync(dotNextDir)) {
      return HealthResult.warn(
        this.name,
        this.category,
        "No production build found (.next directory missing). Run 'npm run build' to generate.",
        "MEDIUM",
        0,
        { recommendation: "Run 'npm run build' in frontend/ to generate production build artifacts." }
      );
    }

    const hasBuildId = fs.existsSync(buildIdPath);
    const hasStatic = fs.existsSync(staticDir);
    const hasServer = fs.existsSync(serverDir);

    if (!hasBuildId || !hasStatic || !hasServer) {
      return HealthResult.warn(
        this.name,
        this.category,
        "Production build is incomplete or stale. Rebuild recommended.",
        "MEDIUM",
        0,
        { hasBuildId, hasStatic, hasServer, recommendation: "Run 'npm run build' to complete build." }
      );
    }

    const buildId = fs.readFileSync(buildIdPath, "utf-8").trim();

    return HealthResult.pass(
      this.name,
      this.category,
      `Valid production build verified (Build ID: ${buildId}).`,
      0,
      { buildId }
    );
  }
}
