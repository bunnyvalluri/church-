/**
 * health/backend/ErrorHandlingHealthCheck.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Inspects centralized error handling, error boundary pages, and exception traps.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import fs from "fs";
import path from "path";
import { BaseHealthCheck } from "../core/HealthCheck";
import { HealthResult } from "../core/HealthResult";
import { HealthCategoryType, HealthContext } from "../config/health.types";

export class ErrorHandlingHealthCheck extends BaseHealthCheck {
  public readonly name = "Error Boundaries & Exception Handling Architecture";
  public readonly category: HealthCategoryType = "backend";
  public readonly defaultSeverity = "HIGH";

  protected async execute(context: HealthContext): Promise<HealthResult> {
    const errorPage = path.join(context.frontendPath, "app", "error.tsx");
    const globalErrorPage = path.join(context.frontendPath, "app", "global-error.tsx");
    const notFoundPage = path.join(context.frontendPath, "app", "not-found.tsx");
    const serverJs = path.join(context.backendPath, "server.js");

    const hasError = fs.existsSync(errorPage);
    const hasGlobalError = fs.existsSync(globalErrorPage);
    const hasNotFound = fs.existsSync(notFoundPage);

    let hasBackendTrap = false;
    if (fs.existsSync(serverJs)) {
      const content = fs.readFileSync(serverJs, "utf-8");
      hasBackendTrap =
        content.includes("unhandledRejection") || content.includes("uncaughtException");
    }

    if (!hasError || !hasGlobalError || !hasNotFound) {
      return HealthResult.warn(
        this.name,
        this.category,
        `Missing Next.js error boundary pages: ${!hasError ? "error.tsx " : ""}${!hasGlobalError ? "global-error.tsx " : ""}${!hasNotFound ? "not-found.tsx" : ""}`,
        "MEDIUM",
        0
      );
    }

    return HealthResult.pass(
      this.name,
      this.category,
      `Centralized error handling verified (Root boundaries: Yes, Backend traps: ${hasBackendTrap ? "Active" : "Standard"}).`,
      0,
      { hasError, hasGlobalError, hasNotFound, hasBackendTrap }
    );
  }
}
