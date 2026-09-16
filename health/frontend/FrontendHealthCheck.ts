/**
 * health/frontend/FrontendHealthCheck.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Validates frontend project structure, Next.js configuration, and core package health.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import fs from "fs";
import path from "path";
import { BaseHealthCheck } from "../core/HealthCheck";
import { HealthResult } from "../core/HealthResult";
import { HealthCategoryType, HealthContext } from "../config/health.types";

export class FrontendHealthCheck extends BaseHealthCheck {
  public readonly name = "Frontend Workspace Configuration";
  public readonly category: HealthCategoryType = "frontend";
  public readonly defaultSeverity = "HIGH";

  protected async execute(context: HealthContext): Promise<HealthResult> {
    const pkgPath = path.join(context.frontendPath, "package.json");
    const nextConfigPath = path.join(context.frontendPath, "next.config.js");
    const tsConfigPath = path.join(context.frontendPath, "tsconfig.json");

    if (!fs.existsSync(pkgPath)) {
      return HealthResult.fail(
        this.name,
        this.category,
        "frontend/package.json is missing",
        "CRITICAL",
        0,
        { file: pkgPath, recommendation: "Ensure frontend/package.json exists." }
      );
    }

    const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf-8"));
    const hasNext = !!pkg.dependencies?.next;
    const hasReact = !!pkg.dependencies?.react;

    if (!hasNext || !hasReact) {
      return HealthResult.fail(
        this.name,
        this.category,
        "Next.js or React dependency missing in frontend/package.json",
        "CRITICAL",
        0,
        { file: pkgPath }
      );
    }

    const hasTsConfig = fs.existsSync(tsConfigPath);
    const hasNextConfig = fs.existsSync(nextConfigPath);

    if (!hasTsConfig || !hasNextConfig) {
      return HealthResult.warn(
        this.name,
        this.category,
        `Frontend missing configuration files: ${!hasTsConfig ? "tsconfig.json " : ""}${!hasNextConfig ? "next.config.js" : ""}`,
        "MEDIUM",
        0,
        { recommendation: "Restore standard Next.js configuration files." }
      );
    }

    return HealthResult.pass(
      this.name,
      this.category,
      `Frontend configured correctly with Next.js ${pkg.dependencies.next} and React ${pkg.dependencies.react}`,
      0,
      { nextVersion: pkg.dependencies.next, reactVersion: pkg.dependencies.react }
    );
  }
}
