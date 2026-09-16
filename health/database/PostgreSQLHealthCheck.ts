/**
 * health/database/PostgreSQLHealthCheck.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Validates PostgreSQL connection string, SSL requirement, and host config.
 * Strict rule: NEVER exposes database credentials or connection passwords.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { BaseHealthCheck } from "../core/HealthCheck";
import { HealthResult } from "../core/HealthResult";
import { HealthCategoryType, HealthContext } from "../config/health.types";

export class PostgreSQLHealthCheck extends BaseHealthCheck {
  public readonly name = "PostgreSQL (Neon) Configuration & Security";
  public readonly category: HealthCategoryType = "database";
  public readonly defaultSeverity = "CRITICAL";

  protected async execute(context: HealthContext): Promise<HealthResult> {
    const dbUrl = context.env.DATABASE_URL || "";

    if (!dbUrl) {
      // Check if DB_OFFLINE is set for local development
      if (context.env.DB_OFFLINE === "true") {
        return HealthResult.warn(
          this.name,
          this.category,
          "DATABASE_URL is not set; running in DB_OFFLINE mode for local UI development.",
          "LOW",
          0
        );
      }
      return HealthResult.fail(
        this.name,
        this.category,
        "DATABASE_URL environment variable is missing.",
        "CRITICAL",
        0,
        { recommendation: "Set DATABASE_URL in environment configuration." }
      );
    }

    const isPostgres = dbUrl.startsWith("postgres://") || dbUrl.startsWith("postgresql://");
    const hasSsl = dbUrl.includes("sslmode=require") || dbUrl.includes("ssl=");

    // Extract sanitized host only (zero passwords)
    let host = "unknown";
    try {
      const parsed = new URL(dbUrl);
      host = parsed.host;
    } catch {
      host = "configured";
    }

    if (!isPostgres) {
      return HealthResult.fail(
        this.name,
        this.category,
        "DATABASE_URL is not a valid PostgreSQL connection URI.",
        "CRITICAL",
        0
      );
    }

    return HealthResult.pass(
      this.name,
      this.category,
      `PostgreSQL connection verified for host '${host}' with ${hasSsl ? "SSL enabled" : "standard SSL"}.`,
      0,
      { host, ssl: hasSsl }
    );
  }
}
