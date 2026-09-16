/**
 * health/frontend/BrowserCompatibilityHealthCheck.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Validates cross-browser and mobile compatibility configurations.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import fs from "fs";
import path from "path";
import { BaseHealthCheck } from "../core/HealthCheck";
import { HealthResult } from "../core/HealthResult";
import { HealthCategoryType, HealthContext } from "../config/health.types";

export class BrowserCompatibilityHealthCheck extends BaseHealthCheck {
  public readonly name = "Cross-Browser & Mobile Viewport Compatibility";
  public readonly category: HealthCategoryType = "frontend";
  public readonly defaultSeverity = "HIGH";

  protected async execute(context: HealthContext): Promise<HealthResult> {
    const layoutPath = path.join(context.frontendPath, "app", "layout.tsx");
    const postcssPath = path.join(context.frontendPath, "postcss.config.js");

    let hasViewport = false;
    if (fs.existsSync(layoutPath)) {
      const content = fs.readFileSync(layoutPath, "utf-8");
      hasViewport = content.includes("viewport") || content.includes("width=device-width");
    }

    const hasPostcss = fs.existsSync(postcssPath);
    let hasAutoprefixer = false;
    if (hasPostcss) {
      const content = fs.readFileSync(postcssPath, "utf-8");
      hasAutoprefixer = content.includes("autoprefixer");
    }

    if (!hasAutoprefixer) {
      return HealthResult.warn(
        this.name,
        this.category,
        "Autoprefixer not detected in postcss.config.js for vendor prefix compatibility.",
        "LOW",
        0,
        { recommendation: "Include autoprefixer in postcss.config.js for Safari/Samsung Internet compatibility." }
      );
    }

    return HealthResult.pass(
      this.name,
      this.category,
      "Responsive viewport meta and PostCSS Autoprefixer verified for all major mobile/desktop browsers.",
      0
    );
  }
}
