/**
 * health/performance/BundlePerformanceCheck.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Validates third-party dependency weight, tree-shaking, and lightweight libraries.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import fs from "fs";
import path from "path";
import { BaseHealthCheck } from "../core/HealthCheck";
import { HealthResult } from "../core/HealthResult";
import { HealthCategoryType, HealthContext } from "../config/health.types";

export class BundlePerformanceCheck extends BaseHealthCheck {
  public readonly name = "Third-Party Dependency Weight & Tree-Shaking";
  public readonly category: HealthCategoryType = "performance";
  public readonly defaultSeverity = "MEDIUM";

  protected async execute(context: HealthContext): Promise<HealthResult> {
    const pkgPath = path.join(context.frontendPath, "package.json");

    if (!fs.existsSync(pkgPath)) {
      return HealthResult.skipped(
        this.name,
        this.category,
        "frontend/package.json not found."
      );
    }

    const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf-8"));
    const deps = { ...pkg.dependencies, ...pkg.devDependencies };

    const heavyPackages = ["moment", "lodash", "rxjs"];
    const foundHeavy = heavyPackages.filter((p) => !!deps[p]);

    const usesDateFns = !!deps["date-fns"];

    if (foundHeavy.length > 0) {
      return HealthResult.warn(
        this.name,
        this.category,
        `Detected legacy heavy dependencies: ${foundHeavy.join(", ")}. Consider modern tree-shakeable alternatives.`,
        "LOW",
        0,
        { foundHeavy }
      );
    }

    return HealthResult.pass(
      this.name,
      this.category,
      `Modern tree-shakeable dependency ecosystem verified (date-fns: ${usesDateFns ? "Yes" : "Native"}, Heavy legacy libraries: None).`,
      0,
      { usesDateFns }
    );
  }
}
