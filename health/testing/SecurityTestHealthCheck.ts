/**
 * health/testing/SecurityTestHealthCheck.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Validates security-focused automated test specifications and bundle scanners.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import fs from "fs";
import path from "path";
import { BaseHealthCheck } from "../core/HealthCheck";
import { HealthResult } from "../core/HealthResult";
import { HealthCategoryType, HealthContext } from "../config/health.types";

export class SecurityTestHealthCheck extends BaseHealthCheck {
  public readonly name = "Automated Security Test Suites & Bundle Scanners";
  public readonly category: HealthCategoryType = "testing";
  public readonly defaultSeverity = "HIGH";

  protected async execute(context: HealthContext): Promise<HealthResult> {
    const scanScript = path.join(context.workspaceRoot, "scripts", "scan_production_bundle.js");
    const securityTestsDir = path.join(context.frontendPath, "tests", "security");

    const hasScanScript = fs.existsSync(scanScript);
    const hasSecurityTests = fs.existsSync(securityTestsDir);

    if (!hasScanScript && !hasSecurityTests) {
      return HealthResult.warn(
        this.name,
        this.category,
        "Automated production bundle secret scanner not found.",
        "MEDIUM",
        0
      );
    }

    return HealthResult.pass(
      this.name,
      this.category,
      `Automated security testing infrastructure active (Bundle Secret Scanner: ${hasScanScript ? "Yes" : "No"}, Security Specs: ${hasSecurityTests ? "Yes" : "No"}).`,
      0,
      { hasScanScript, hasSecurityTests }
    );
  }
}
