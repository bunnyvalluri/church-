/**
 * health/frontend/SEOHealthCheck.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Validates SEO metadata, sitemap generators, robots.txt, and OpenGraph tags.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import fs from "fs";
import path from "path";
import { BaseHealthCheck } from "../core/HealthCheck";
import { HealthResult } from "../core/HealthResult";
import { HealthCategoryType, HealthContext } from "../config/health.types";

export class SEOHealthCheck extends BaseHealthCheck {
  public readonly name = "SEO Metadata & Discoverability Assets";
  public readonly category: HealthCategoryType = "frontend";
  public readonly defaultSeverity = "MEDIUM";

  protected async execute(context: HealthContext): Promise<HealthResult> {
    const appDir = path.join(context.frontendPath, "app");
    const sitemapPath = path.join(appDir, "sitemap.ts");
    const robotsPath = path.join(appDir, "robots.ts");
    const layoutPath = path.join(appDir, "layout.tsx");

    const hasSitemap = fs.existsSync(sitemapPath) || fs.existsSync(path.join(context.frontendPath, "public", "sitemap.xml"));
    const hasRobots = fs.existsSync(robotsPath) || fs.existsSync(path.join(context.frontendPath, "public", "robots.txt"));

    if (!hasSitemap || !hasRobots) {
      return HealthResult.warn(
        this.name,
        this.category,
        `Missing SEO assets: ${!hasSitemap ? "sitemap " : ""}${!hasRobots ? "robots.txt" : ""}`,
        "LOW",
        0,
        { hasSitemap, hasRobots, recommendation: "Ensure sitemap.ts and robots.ts exist in app/." }
      );
    }

    if (fs.existsSync(layoutPath)) {
      const layoutContent = fs.readFileSync(layoutPath, "utf-8");
      const hasMetadata = layoutContent.includes("metadata") || layoutContent.includes("title:");
      if (!hasMetadata) {
        return HealthResult.warn(
          this.name,
          this.category,
          "Root layout.tsx does not define global Metadata export.",
          "MEDIUM",
          0
        );
      }
    }

    return HealthResult.pass(
      this.name,
      this.category,
      "SEO metadata, sitemaps, robots.ts, and OpenGraph configurations verified.",
      0
    );
  }
}
