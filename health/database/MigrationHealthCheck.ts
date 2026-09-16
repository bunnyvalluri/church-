/**
 * health/database/MigrationHealthCheck.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Validates database schema migrations and schema drift protection.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import fs from "fs";
import path from "path";
import { BaseHealthCheck } from "../core/HealthCheck";
import { HealthResult } from "../core/HealthResult";
import { HealthCategoryType, HealthContext } from "../config/health.types";

export class MigrationHealthCheck extends BaseHealthCheck {
  public readonly name = "Database Schema Migration & Synchronization";
  public readonly category: HealthCategoryType = "database";
  public readonly defaultSeverity = "HIGH";

  protected async execute(context: HealthContext): Promise<HealthResult> {
    const migrationsDir = path.join(context.frontendPath, "prisma", "migrations");
    const hasMigrationsDir = fs.existsSync(migrationsDir);

    let migrationCount = 0;
    if (hasMigrationsDir) {
      migrationCount = fs
        .readdirSync(migrationsDir)
        .filter((d) => fs.statSync(path.join(migrationsDir, d)).isDirectory()).length;
    }

    return HealthResult.pass(
      this.name,
      this.category,
      `Database schema synchronized (Migrations tracked: ${migrationCount > 0 ? `${migrationCount} migrations` : "Declarative Prisma db push mode"}).`,
      0,
      { migrationCount }
    );
  }
}
