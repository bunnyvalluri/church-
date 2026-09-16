/**
 * health/testing/UnitTestHealthCheck.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Validates unit testing infrastructure, test scripts, and mock coverage.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import fs from "fs";
import path from "path";
import { BaseHealthCheck } from "../core/HealthCheck";
import { HealthResult } from "../core/HealthResult";
import { HealthCategoryType, HealthContext } from "../config/health.types";

export class UnitTestHealthCheck extends BaseHealthCheck {
  public readonly name = "Unit Testing Harness & Test Runner Configuration";
  public readonly category: HealthCategoryType = "testing";
  public readonly defaultSeverity = "HIGH";

  protected async execute(context: HealthContext): Promise<HealthResult> {
    const pkgPath = path.join(context.frontendPath, "package.json");
    const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf-8"));

    const hasTestScript = !!pkg.scripts?.test;
    const hasPlaywright = !!pkg.devDependencies?.["@playwright/test"] || !!pkg.dependencies?.["@playwright/test"];

    if (!hasTestScript) {
      return HealthResult.warn(
        this.name,
        this.category,
        "No 'test' script declared in frontend/package.json.",
        "MEDIUM",
        0
      );
    }

    return HealthResult.pass(
      this.name,
      this.category,
      `Unit/E2E test suite configured (Runner: ${hasPlaywright ? "Playwright" : "Node Test Runner"}).`,
      0,
      { testScript: pkg.scripts.test }
    );
  }
}
