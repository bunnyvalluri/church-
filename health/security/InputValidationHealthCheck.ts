/**
 * health/security/InputValidationHealthCheck.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Scans codebase for dangerous execution primitives (eval, $queryRawUnsafe, exec).
 * ─────────────────────────────────────────────────────────────────────────────
 */

import fs from "fs";
import path from "path";
import { BaseHealthCheck } from "../core/HealthCheck";
import { HealthResult } from "../core/HealthResult";
import { HealthCategoryType, HealthContext } from "../config/health.types";

export class InputValidationHealthCheck extends BaseHealthCheck {
  public readonly name = "Injection Flaws & Dangerous Execution Primitives";
  public readonly category: HealthCategoryType = "security";
  public readonly defaultSeverity = "CRITICAL";

  protected async execute(context: HealthContext): Promise<HealthResult> {
    const dangerousPatterns = [
      { name: "Unparameterized SQL ($queryRawUnsafe)", regex: /\$queryRawUnsafe\s*\(/g },
      { name: "Arbitrary Code Execution (eval)", regex: /\beval\s*\(/g },
      { name: "Shell Command Execution (child_process.exec)", regex: /child_process['"]?\)\.exec\s*\(/g },
    ];

    const violations: Array<{ file: string; pattern: string }> = [];

    const scan = (dir: string) => {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      for (const e of entries) {
        const full = path.join(dir, e.name);
        if (
          e.isDirectory() &&
          e.name !== "node_modules" &&
          e.name !== ".next" &&
          e.name !== ".git" &&
          e.name !== "health"
        ) {
          scan(full);
        } else if (
          e.isFile() &&
          (e.name.endsWith(".ts") || e.name.endsWith(".tsx") || e.name.endsWith(".js"))
        ) {
          const content = fs.readFileSync(full, "utf-8");
          for (const p of dangerousPatterns) {
            p.regex.lastIndex = 0;
            if (p.regex.test(content)) {
              violations.push({
                file: path.relative(context.workspaceRoot, full),
                pattern: p.name,
              });
            }
          }
        }
      }
    };

    scan(context.frontendPath);
    scan(context.backendPath);

    if (violations.length > 0) {
      return HealthResult.fail(
        this.name,
        this.category,
        `Detected ${violations.length} dangerous execution primitive(s): ${violations.map((v) => `${v.pattern} in ${v.file}`).join(", ")}`,
        "CRITICAL",
        0,
        { violations, recommendation: "Replace raw unparameterized calls with safe parameterized abstractions." }
      );
    }

    return HealthResult.pass(
      this.name,
      this.category,
      "Zero dangerous execution primitives ($queryRawUnsafe, eval, raw exec) detected in application code.",
      0
    );
  }
}
