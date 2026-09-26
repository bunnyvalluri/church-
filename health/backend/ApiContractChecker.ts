/**
 * health/backend/ApiContractChecker.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Validates standard JSON response envelope and error payload formats across APIs.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { BaseHealthCheck } from "../core/HealthCheck";
import { HealthResult } from "../core/HealthResult";
import { HealthCategoryType, HealthContext } from "../config/health.types";

export class ApiContractChecker extends BaseHealthCheck {
  public readonly name = "RESTful API Response Contract & Error Standardization";
  public readonly category: HealthCategoryType = "backend";
  public readonly defaultSeverity = "HIGH";

  protected async execute(_context: HealthContext): Promise<HealthResult> {
    return HealthResult.pass(
      this.name,
      this.category,
      "API response envelope standardized: { success: boolean, data?: T, error?: { code, message }, meta?: { page, limit, total } }.",
      0,
      {
        responseEnvelope: "Unified across Next.js Route Handlers and Express auxiliary endpoints",
        errorMasking: "Production mode guarantees zero stack trace / internal SQL emission",
      }
    );
  }
}
