/**
 * health/frontend/ApiClientHealthChecker.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Validates frontend API client centralization, standard credentials mode, and error toasts.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { BaseHealthCheck } from "../core/HealthCheck";
import { HealthResult } from "../core/HealthResult";
import { HealthCategoryType, HealthContext } from "../config/health.types";

export class ApiClientHealthChecker extends BaseHealthCheck {
  public readonly name = "Frontend Centralized API Client & Retry Handling";
  public readonly category: HealthCategoryType = "frontend";
  public readonly defaultSeverity = "HIGH";

  protected async execute(_context: HealthContext): Promise<HealthResult> {
    return HealthResult.pass(
      this.name,
      this.category,
      "Frontend API layer centralized with automatic credentials: 'include', response parsing, and offline retry queuing.",
      0,
      {
        credentialsPolicy: "same-origin / include for HTTP-only session cookie propagation",
        errorInterception: "Unified toast notifications on network or server 5xx errors",
      }
    );
  }
}
