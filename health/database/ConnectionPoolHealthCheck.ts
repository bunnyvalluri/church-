/**
 * health/database/ConnectionPoolHealthCheck.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Validates connection pooling settings and serverless pooler parameters.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { BaseHealthCheck } from "../core/HealthCheck";
import { HealthResult } from "../core/HealthResult";
import { HealthCategoryType, HealthContext } from "../config/health.types";

export class ConnectionPoolHealthCheck extends BaseHealthCheck {
  public readonly name = "Database Connection Pooling & Serverless Sizing";
  public readonly category: HealthCategoryType = "database";
  public readonly defaultSeverity = "MEDIUM";

  protected async execute(context: HealthContext): Promise<HealthResult> {
    const dbUrl = context.env.DATABASE_URL || "";

    const hasPooler =
      dbUrl.includes("-pooler.") ||
      dbUrl.includes("pgbouncer=true") ||
      dbUrl.includes("connection_limit=");

    if (!hasPooler && dbUrl) {
      return HealthResult.warn(
        this.name,
        this.category,
        "Direct database connection detected without PgBouncer connection pooler in DATABASE_URL.",
        "LOW",
        0,
        { recommendation: "For Neon serverless, use pooled connection string to avoid connection starvation under load." }
      );
    }

    return HealthResult.pass(
      this.name,
      this.category,
      "Connection pooling configuration verified for serverless database concurrency.",
      0,
      { pooled: hasPooler }
    );
  }
}
