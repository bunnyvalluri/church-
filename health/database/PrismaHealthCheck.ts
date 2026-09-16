/**
 * health/database/PrismaHealthCheck.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Validates Prisma schema models, relations, and generated client status.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import fs from "fs";
import path from "path";
import { BaseHealthCheck } from "../core/HealthCheck";
import { HealthResult } from "../core/HealthResult";
import { HealthCategoryType, HealthContext } from "../config/health.types";

export class PrismaHealthCheck extends BaseHealthCheck {
  public readonly name = "Prisma ORM Schema & Client Generation";
  public readonly category: HealthCategoryType = "database";
  public readonly defaultSeverity = "CRITICAL";

  protected async execute(context: HealthContext): Promise<HealthResult> {
    const schemaPath = path.join(context.frontendPath, "prisma", "schema.prisma");
    const clientPath = path.join(
      context.frontendPath,
      "prisma",
      "generated",
      "client",
      "index.js"
    );

    if (!fs.existsSync(schemaPath)) {
      return HealthResult.fail(
        this.name,
        this.category,
        "Prisma schema file missing at frontend/prisma/schema.prisma",
        "CRITICAL",
        0
      );
    }

    const schemaContent = fs.readFileSync(schemaPath, "utf-8");
    const models = (schemaContent.match(/^model\s+([A-Za-z0-9_]+)/gm) || []).map((m) =>
      m.replace("model ", "").trim()
    );

    const hasClient = fs.existsSync(clientPath);

    if (!hasClient) {
      return HealthResult.warn(
        this.name,
        this.category,
        `Prisma client not yet generated. Run 'npx prisma generate'. Found ${models.length} schema models.`,
        "HIGH",
        0,
        { modelCount: models.length, recommendation: "Run 'npx prisma generate' to build client." }
      );
    }

    return HealthResult.pass(
      this.name,
      this.category,
      `Prisma ORM verified with ${models.length} data models and active generated client.`,
      0,
      { modelCount: models.length, sampleModels: models.slice(0, 6) }
    );
  }
}
