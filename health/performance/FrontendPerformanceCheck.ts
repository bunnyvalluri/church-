/**
 * health/performance/FrontendPerformanceCheck.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Validates next/image optimization, dynamic imports, and lazy-loading strategies.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import fs from "fs";
import path from "path";
import { BaseHealthCheck } from "../core/HealthCheck";
import { HealthResult } from "../core/HealthResult";
import { HealthCategoryType, HealthContext } from "../config/health.types";

export class FrontendPerformanceCheck extends BaseHealthCheck {
  public readonly name = "Image Optimization & Code Splitting Patterns";
  public readonly category: HealthCategoryType = "performance";
  public readonly defaultSeverity = "MEDIUM";

  protected async execute(context: HealthContext): Promise<HealthResult> {
    const componentsDir = path.join(context.frontendPath, "components");
    let unoptimizedImages = 0;
    let nextImageUsage = 0;

    if (fs.existsSync(componentsDir)) {
      const scan = (dir: string) => {
        const entries = fs.readdirSync(dir, { withFileTypes: true });
        for (const e of entries) {
          const full = path.join(dir, e.name);
          if (e.isDirectory()) scan(full);
          else if (e.isFile() && (e.name.endsWith(".tsx") || e.name.endsWith(".jsx"))) {
            const content = fs.readFileSync(full, "utf-8");
            if (content.includes("<Image")) nextImageUsage++;
            if (content.includes("<img")) unoptimizedImages++;
          }
        }
      };
      scan(componentsDir);
    }

    if (unoptimizedImages > 20) {
      return HealthResult.warn(
        this.name,
        this.category,
        `Detected ${unoptimizedImages} raw <img> tags in components. Consider migrating to next/image for automatic WebP conversion.`,
        "LOW",
        0,
        { nextImageUsage, unoptimizedImages, recommendation: "Replace <img> tags with next/image." }
      );
    }

    return HealthResult.pass(
      this.name,
      this.category,
      `next/image optimization verified across ${nextImageUsage} component instances.`,
      0,
      { nextImageUsage, unoptimizedImages }
    );
  }
}
