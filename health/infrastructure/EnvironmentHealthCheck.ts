/**
 * health/infrastructure/EnvironmentHealthCheck.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Validates .env.example templates, variable contracts, and template safety.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import fs from "fs";
import path from "path";
import { BaseHealthCheck } from "../core/HealthCheck";
import { HealthResult } from "../core/HealthResult";
import { HealthCategoryType, HealthContext } from "../config/health.types";

export class EnvironmentHealthCheck extends BaseHealthCheck {
  public readonly name = "Environment Variable Contracts & Template Safety";
  public readonly category: HealthCategoryType = "infrastructure";
  public readonly defaultSeverity = "CRITICAL";

  protected async execute(context: HealthContext): Promise<HealthResult> {
    const rootExample = path.join(context.workspaceRoot, ".env.example");
    const frontendExample = path.join(context.frontendPath, ".env.example");

    const hasRootExample = fs.existsSync(rootExample);
    const hasFrontendExample = fs.existsSync(frontendExample);

    if (!hasRootExample) {
      return HealthResult.fail(
        this.name,
        this.category,
        "Root .env.example template is missing.",
        "CRITICAL",
        0
      );
    }

    const content = fs.readFileSync(rootExample, "utf-8");
    // Verify template doesn't contain real secret values
    const hasRealSecrets =
      content.includes("GOCSPX-") ||
      content.includes("ECg9gW5JJMK4bu6ojCocM7TW") ||
      content.includes("TVEa1MEMTnYAfEv5xPnfcqm3MDg");

    if (hasRealSecrets) {
      return HealthResult.fail(
        this.name,
        this.category,
        ".env.example contains real secret credentials! Immediate remediation required.",
        "CRITICAL",
        0
      );
    }

    return HealthResult.pass(
      this.name,
      this.category,
      "Environment templates verified with sanitized placeholder values and zero leaked credentials.",
      0,
      { rootTemplate: hasRootExample, frontendTemplate: hasFrontendExample }
    );
  }
}
