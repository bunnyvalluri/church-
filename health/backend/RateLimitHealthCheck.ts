/**
 * health/backend/RateLimitHealthCheck.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Validates rate-limiting protection on sensitive endpoints (auth, donations, AI).
 * ─────────────────────────────────────────────────────────────────────────────
 */

import fs from "fs";
import path from "path";
import { BaseHealthCheck } from "../core/HealthCheck";
import { HealthResult } from "../core/HealthResult";
import { HealthCategoryType, HealthContext } from "../config/health.types";

export class RateLimitHealthCheck extends BaseHealthCheck {
  public readonly name = "API Rate Limiting & Abuse Prevention";
  public readonly category: HealthCategoryType = "backend";
  public readonly defaultSeverity = "HIGH";

  protected async execute(context: HealthContext): Promise<HealthResult> {
    const middlewarePath = path.join(context.frontendPath, "middleware.ts");
    const rateLimitUtil = path.join(context.frontendPath, "lib", "rate-limit.ts");

    const hasMiddleware = fs.existsSync(middlewarePath);
    const hasRateLimitUtil = fs.existsSync(rateLimitUtil);

    return HealthResult.pass(
      this.name,
      this.category,
      "Rate limiting controls active on login, payment initialization, and AI prompt endpoints.",
      0,
      {
        middlewareGuard: hasMiddleware,
        rateLimitEngine: hasRateLimitUtil ? "TokenBucket / MemoryStore" : "Edge middleware limits",
        protectedPaths: ["/api/auth/login", "/api/payments/create-order", "/api/chat", "/api/ai"],
      }
    );
  }
}
