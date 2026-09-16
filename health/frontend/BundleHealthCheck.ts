/**
 * health/frontend/BundleHealthCheck.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Inspects client JavaScript bundle chunks against performance thresholds.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import fs from "fs";
import path from "path";
import { BaseHealthCheck } from "../core/HealthCheck";
import { HealthResult } from "../core/HealthResult";
import { HealthCategoryType, HealthContext } from "../config/health.types";
import { defaultHealthConfig } from "../config/health.config";

export class BundleHealthCheck extends BaseHealthCheck {
  public readonly name = "Client Bundle Budget & Chunk Sizing";
  public readonly category: HealthCategoryType = "frontend";
  public readonly defaultSeverity = "MEDIUM";

  protected async execute(context: HealthContext): Promise<HealthResult> {
    const staticChunks = path.join(context.frontendPath, ".next", "static", "chunks");

    if (!fs.existsSync(staticChunks)) {
      return HealthResult.skipped(
        this.name,
        this.category,
        "Compiled chunks directory not found. Run build before bundle inspection."
      );
    }

    let totalSizeBytes = 0;
    let oversizedChunks: Array<{ file: string; sizeKb: number }> = [];

    const scan = (dir: string) => {
      const files = fs.readdirSync(dir, { withFileTypes: true });
      for (const f of files) {
        const full = path.join(dir, f.name);
        if (f.isDirectory()) {
          scan(full);
        } else if (f.isFile() && f.name.endsWith(".js")) {
          const stats = fs.statSync(full);
          totalSizeBytes += stats.size;
          const sizeKb = Math.round(stats.size / 1024);
          if (sizeKb > defaultHealthConfig.performanceThresholds.maxClientBundleChunkKb) {
            oversizedChunks.push({
              file: path.relative(staticChunks, full),
              sizeKb,
            });
          }
        }
      }
    };

    scan(staticChunks);

    const totalMb = (totalSizeBytes / (1024 * 1024)).toFixed(2);

    if (oversizedChunks.length > 0) {
      return HealthResult.warn(
        this.name,
        this.category,
        `Found ${oversizedChunks.length} chunk(s) exceeding ${defaultHealthConfig.performanceThresholds.maxClientBundleChunkKb}KB limit (Total: ${totalMb}MB)`,
        "MEDIUM",
        0,
        {
          oversizedChunks: oversizedChunks.slice(0, 5),
          totalMb,
          recommendation: "Use dynamic imports (next/dynamic) to split large chunks.",
        }
      );
    }

    return HealthResult.pass(
      this.name,
      this.category,
      `Client bundles within performance budget. Total: ${totalMb}MB across chunks.`,
      0,
      { totalMb }
    );
  }
}
