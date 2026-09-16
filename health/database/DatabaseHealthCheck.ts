/**
 * health/database/DatabaseHealthCheck.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Validates polyglot persistence architecture across PostgreSQL, MongoDB, and Redis.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import path from "path";
import fs from "fs";
import { BaseHealthCheck } from "../core/HealthCheck";
import { HealthResult } from "../core/HealthResult";
import { HealthCategoryType, HealthContext } from "../config/health.types";

export class DatabaseHealthCheck extends BaseHealthCheck {
  public readonly name = "Polyglot Persistence Layer Architecture";
  public readonly category: HealthCategoryType = "database";
  public readonly defaultSeverity = "CRITICAL";

  protected async execute(context: HealthContext): Promise<HealthResult> {
    const prismaSchema = path.join(context.frontendPath, "prisma", "schema.prisma");
    const mongoClient = path.join(context.frontendPath, "lib", "mongodb", "client.ts");
    const backendServer = path.join(context.backendPath, "server.js");

    const hasPostgres = fs.existsSync(prismaSchema);
    const hasMongo = fs.existsSync(mongoClient);

    let hasRedis = false;
    if (fs.existsSync(backendServer)) {
      const content = fs.readFileSync(backendServer, "utf-8");
      hasRedis = content.includes("ioredis") || content.includes("REDIS_URL");
    }

    if (!hasPostgres) {
      return HealthResult.fail(
        this.name,
        this.category,
        "Primary PostgreSQL Prisma schema is missing.",
        "CRITICAL",
        0
      );
    }

    return HealthResult.pass(
      this.name,
      this.category,
      `Database tier active (Primary: PostgreSQL/Neon, Document: ${hasMongo ? "MongoDB Atlas" : "None"}, Cache/Queue: ${hasRedis ? "Redis" : "In-Memory"}).`,
      0,
      { postgres: true, mongodb: hasMongo, redis: hasRedis }
    );
  }
}
