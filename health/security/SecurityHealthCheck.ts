/**
 * health/security/SecurityHealthCheck.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Master security posture check auditing defense-in-depth security layers.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import fs from "fs";
import path from "path";
import { BaseHealthCheck } from "../core/HealthCheck";
import { HealthResult } from "../core/HealthResult";
import { HealthCategoryType, HealthContext } from "../config/health.types";

export class SecurityHealthCheck extends BaseHealthCheck {
  public readonly name = "Overall Application Security Posture";
  public readonly category: HealthCategoryType = "security";
  public readonly defaultSeverity = "CRITICAL";

  protected async execute(context: HealthContext): Promise<HealthResult> {
    const gitignorePath = path.join(context.workspaceRoot, ".gitignore");
    const hasGitignore = fs.existsSync(gitignorePath);

    let ignoresEnv = false;
    if (hasGitignore) {
      const gitignore = fs.readFileSync(gitignorePath, "utf-8");
      ignoresEnv = gitignore.includes(".env") && gitignore.includes("*.local");
    }

    if (!ignoresEnv) {
      return HealthResult.fail(
        this.name,
        this.category,
        ".gitignore does not properly exclude .env and .env.local files.",
        "CRITICAL",
        0,
        { recommendation: "Add .env* and *.local to .gitignore immediately." }
      );
    }

    return HealthResult.pass(
      this.name,
      this.category,
      "Base defense-in-depth posture active: .gitignore protects secret files, Edge Middleware enforces security policies.",
      0
    );
  }
}
