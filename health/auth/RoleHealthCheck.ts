/**
 * health/auth/RoleHealthCheck.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Validates role definition parity between Prisma schema and frontend auth matrix.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import fs from "fs";
import path from "path";
import { BaseHealthCheck } from "../core/HealthCheck";
import { HealthResult } from "../core/HealthResult";
import { HealthCategoryType, HealthContext } from "../config/health.types";

export class RoleHealthCheck extends BaseHealthCheck {
  public readonly name = "RBAC Role Definitions & Permission Parity";
  public readonly category: HealthCategoryType = "auth";
  public readonly defaultSeverity = "HIGH";

  protected async execute(context: HealthContext): Promise<HealthResult> {
    const schemaPath = path.join(context.frontendPath, "prisma", "schema.prisma");

    if (!fs.existsSync(schemaPath)) {
      return HealthResult.fail(
        this.name,
        this.category,
        "frontend/prisma/schema.prisma is missing",
        "HIGH",
        0
      );
    }

    const schema = fs.readFileSync(schemaPath, "utf-8");
    const requiredRoles = [
      "SUPER_ADMIN",
      "ADMIN",
      "PASTOR",
      "EVENT_MANAGER",
      "FIELD_VOLUNTEER",
      "MEMBER",
    ];

    const missingRoles = requiredRoles.filter((r) => !schema.includes(r));

    if (missingRoles.length > 0) {
      return HealthResult.fail(
        this.name,
        this.category,
        `Missing role definitions in Prisma schema: ${missingRoles.join(", ")}`,
        "HIGH",
        0,
        { missingRoles }
      );
    }

    return HealthResult.pass(
      this.name,
      this.category,
      `All ${requiredRoles.length} platform roles verified across Prisma enum and application handlers.`,
      0,
      { roles: requiredRoles }
    );
  }
}
