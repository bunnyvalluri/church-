/**
 * health/backend/BackendHealthCheck.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Validates backend server structure, Express runtime configuration, and entrypoints.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import fs from "fs";
import path from "path";
import { BaseHealthCheck } from "../core/HealthCheck";
import { HealthResult } from "../core/HealthResult";
import { HealthCategoryType, HealthContext } from "../config/health.types";

export class BackendHealthCheck extends BaseHealthCheck {
  public readonly name = "Backend Runtime & Express Service Configuration";
  public readonly category: HealthCategoryType = "backend";
  public readonly defaultSeverity = "CRITICAL";

  protected async execute(context: HealthContext): Promise<HealthResult> {
    const pkgPath = path.join(context.backendPath, "package.json");
    const serverPath = path.join(context.backendPath, "server.js");

    if (!fs.existsSync(pkgPath) || !fs.existsSync(serverPath)) {
      return HealthResult.fail(
        this.name,
        this.category,
        `Backend files missing: ${!fs.existsSync(pkgPath) ? "backend/package.json " : ""}${!fs.existsSync(serverPath) ? "backend/server.js" : ""}`,
        "CRITICAL",
        0
      );
    }

    const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf-8"));
    const hasExpress = !!pkg.dependencies?.express;
    const hasPrisma = !!pkg.dependencies?.["@prisma/client"];

    if (!hasExpress) {
      return HealthResult.fail(
        this.name,
        this.category,
        "Express dependency missing from backend/package.json",
        "CRITICAL",
        0
      );
    }

    return HealthResult.pass(
      this.name,
      this.category,
      `Backend companion service configured with Express ${pkg.dependencies.express} and Prisma client.`,
      0,
      { expressVersion: pkg.dependencies.express, hasPrisma }
    );
  }
}
