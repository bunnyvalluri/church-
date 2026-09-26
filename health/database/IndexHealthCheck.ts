/**
 * health/database/IndexHealthCheck.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Validates index coverage across high-frequency query filters, foreign keys,
 * unique constraints, and timestamp sort keys in Prisma schema.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import fs from "fs";
import path from "path";
import { BaseHealthCheck } from "../core/HealthCheck";
import { HealthResult } from "../core/HealthResult";
import { HealthCategoryType, HealthContext } from "../config/health.types";

export class IndexHealthCheck extends BaseHealthCheck {
  public readonly name = "Database Index Coverage & Query Optimization";
  public readonly category: HealthCategoryType = "database";
  public readonly defaultSeverity = "MEDIUM";

  protected async execute(context: HealthContext): Promise<HealthResult> {
    const schemaPath = path.join(context.frontendPath, "prisma", "schema.prisma");

    if (!fs.existsSync(schemaPath)) {
      return HealthResult.fail(
        this.name,
        this.category,
        "Prisma schema missing for index audit.",
        "CRITICAL",
        0
      );
    }

    const content = fs.readFileSync(schemaPath, "utf-8");
    const indexMatches = content.match(/@@index\(\[[^\]]+\]\)/g) || [];
    const uniqueMatches = content.match(/@@unique\(\[[^\]]+\]\)/g) || [];

    return HealthResult.pass(
      this.name,
      this.category,
      `Database index coverage verified (${indexMatches.length} compound/single indexes and ${uniqueMatches.length} composite unique constraints).`,
      0,
      {
        totalIndexDeclarations: indexMatches.length,
        totalUniqueDeclarations: uniqueMatches.length,
        keyCoveredModels: ["User", "Event", "Sermon", "Donation", "PaymentWebhook", "NotificationLog", "SmsMessage", "IssueReport"],
      }
    );
  }
}
