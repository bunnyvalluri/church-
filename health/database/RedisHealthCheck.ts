/**
 * health/database/RedisHealthCheck.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Validates Redis cache and BullMQ background task queue configuration.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { BaseHealthCheck } from "../core/HealthCheck";
import { HealthResult } from "../core/HealthResult";
import { HealthCategoryType, HealthContext } from "../config/health.types";

export class RedisHealthCheck extends BaseHealthCheck {
  public readonly name = "Redis Cache & BullMQ Queue Integration";
  public readonly category: HealthCategoryType = "database";
  public readonly defaultSeverity = "MEDIUM";

  protected async execute(context: HealthContext): Promise<HealthResult> {
    const redisUrl = context.env.REDIS_URL || "";

    if (!redisUrl) {
      return HealthResult.warn(
        this.name,
        this.category,
        "REDIS_URL not configured. Background tasks and Socket.io run on in-memory adapters.",
        "LOW",
        0,
        { recommendation: "Configure REDIS_URL for distributed multi-instance cluster synchronization." }
      );
    }

    return HealthResult.pass(
      this.name,
      this.category,
      "Redis connection configured for distributed Pub/Sub and BullMQ queues.",
      0
    );
  }
}
