/**
 * health/testing/E2EHealthCheck.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Validates End-to-End (E2E) browser test suites and Playwright configurations.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import fs from "fs";
import path from "path";
import { BaseHealthCheck } from "../core/HealthCheck";
import { HealthResult } from "../core/HealthResult";
import { HealthCategoryType, HealthContext } from "../config/health.types";

export class E2EHealthCheck extends BaseHealthCheck {
  public readonly name = "End-to-End (E2E) Playwright Test Suites";
  public readonly category: HealthCategoryType = "testing";
  public readonly defaultSeverity = "HIGH";

  protected async execute(context: HealthContext): Promise<HealthResult> {
    const e2eDir = path.join(context.frontendPath, "tests", "e2e");
    const playwrightConfig = path.join(context.frontendPath, "playwright.config.ts");

    const hasE2eDir = fs.existsSync(e2eDir);
    const hasConfig = fs.existsSync(playwrightConfig);

    let e2eSpecs: string[] = [];
    if (hasE2eDir) {
      e2eSpecs = fs
        .readdirSync(e2eDir)
        .filter((f) => f.endsWith(".spec.ts") || f.endsWith(".spec.js"));
    }

    if (e2eSpecs.length === 0) {
      return HealthResult.warn(
        this.name,
        this.category,
        "No E2E test specs found in frontend/tests/e2e.",
        "MEDIUM",
        0
      );
    }

    return HealthResult.pass(
      this.name,
      this.category,
      `Playwright E2E suite verified with ${e2eSpecs.length} spec(s) (Config: ${hasConfig ? "Yes" : "Default"}).`,
      0,
      { e2eSpecs }
    );
  }
}
