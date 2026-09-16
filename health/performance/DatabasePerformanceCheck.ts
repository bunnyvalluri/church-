/**
 * health/performance/DatabasePerformanceCheck.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Validates database indexing coverage and query performance design.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import fs from "fs";
import path from "path";
import { BaseHealthCheck } from "../core/HealthCheck";
import { HealthResult } from "../core/HealthResult";
import { HealthCategoryType, HealthContext } from "../config/health.types";

export class DatabasePerformanceCheck extends BaseHealthCheck {
  public readonly name = "Database Query Optimization & Indexing Strategy";
  public readonly category: HealthCategoryType = "performance";
  public readonly defaultSeverity = "HIGH";

  protected async execute(context: HealthContext): Promise<HealthResult> {
    const schemaPath = path.join(context.frontendPath, "prisma", "schema.prisma");

    if (!fs.existsSync(schemaPath)) {
      return HealthResult.skipped(
        this.name,
        this.category,
        "Prisma schema not found; skipping index performance evaluation."
      );
    }

    const schemaContent = fs.readFileSync(schemaPath, "utf-8");
    const indexMatches = schemaContent.match(/@@index\(\[[^\]]+\]\)/g) || [];
    const uniqueMatches = schemaContent.match(/@unique/g) || [];

    const totalIndexes = indexMatches.length + uniqueMatches.length;

    if (totalIndexes < 5) {
      return HealthResult.warn(
        this.name,
        this.category,
        `Low database index coverage detected (${totalIndexes} indexes across all models).`,
        "MEDIUM",
        0,
        { recommendation: "Add @@index directives to frequently queried foreign keys." }
      );
    }

    return HealthResult.pass(
      this.name,
      this.category,
      `Database indexing verified with ${totalIndexes} compound and unique index definitions.`,
      0,
      { compoundIndexes: indexMatches.length, uniqueConstraints: uniqueMatches.length }
    );
  }
}
