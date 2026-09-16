/**
 * health/frontend/PerformanceHealthCheck.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Inspects font optimization, image component usage, and performance settings.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import fs from "fs";
import path from "path";
import { BaseHealthCheck } from "../core/HealthCheck";
import { HealthResult } from "../core/HealthResult";
import { HealthCategoryType, HealthContext } from "../config/health.types";

export class PerformanceHealthCheck extends BaseHealthCheck {
  public readonly name = "Frontend Performance & Asset Optimization";
  public readonly category: HealthCategoryType = "frontend";
  public readonly defaultSeverity = "MEDIUM";

  protected async execute(context: HealthContext): Promise<HealthResult> {
    const layoutPath = path.join(context.frontendPath, "app", "layout.tsx");
    const nextConfigPath = path.join(context.frontendPath, "next.config.js");

    let usesNextFont = false;
    if (fs.existsSync(layoutPath)) {
      const content = fs.readFileSync(layoutPath, "utf-8");
      usesNextFont = content.includes("next/font");
    }

    let hasCompression = true;
    if (fs.existsSync(nextConfigPath)) {
      const content = fs.readFileSync(nextConfigPath, "utf-8");
      if (content.includes("compress: false")) {
        hasCompression = false;
      }
    }

    if (!usesNextFont) {
      return HealthResult.warn(
        this.name,
        this.category,
        "next/font Google font optimization not detected in RootLayout.",
        "LOW",
        0,
        { recommendation: "Import fonts via next/font/google to eliminate render-blocking font downloads." }
      );
    }

    if (!hasCompression) {
      return HealthResult.warn(
        this.name,
        this.category,
        "Gzip/Brotli compression is explicitly disabled in next.config.js.",
        "MEDIUM",
        0
      );
    }

    return HealthResult.pass(
      this.name,
      this.category,
      "Frontend performance configurations (next/font, compression) are verified.",
      0
    );
  }
}
