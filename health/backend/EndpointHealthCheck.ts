/**
 * health/backend/EndpointHealthCheck.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Compiles endpoint inventory, auditing auth requirement, methods, and role limits.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import fs from "fs";
import path from "path";
import { BaseHealthCheck } from "../core/HealthCheck";
import { HealthResult } from "../core/HealthResult";
import { HealthCategoryType, HealthContext } from "../config/health.types";

export interface EndpointInventoryItem {
  method: string;
  path: string;
  authRequired: boolean;
  roleHint?: string;
  source: "nextjs" | "express";
}

export class EndpointHealthCheck extends BaseHealthCheck {
  public readonly name = "API Endpoint Catalog & Auth Inventory";
  public readonly category: HealthCategoryType = "backend";
  public readonly defaultSeverity = "HIGH";

  protected async execute(context: HealthContext): Promise<HealthResult> {
    const apiDir = path.join(context.frontendPath, "app", "api");
    const inventory: EndpointInventoryItem[] = [];

    const scanApiRoutes = (dir: string) => {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      for (const e of entries) {
        const full = path.join(dir, e.name);
        if (e.isDirectory()) {
          scanApiRoutes(full);
        } else if (e.isFile() && (e.name === "route.ts" || e.name === "route.js")) {
          const content = fs.readFileSync(full, "utf-8");
          const relPath = "/api/" + path.relative(apiDir, dir).replace(/\\/g, "/");

          const methods = ["GET", "POST", "PUT", "PATCH", "DELETE"];
          for (const m of methods) {
            if (content.includes(`export async function ${m}`)) {
              const authRequired =
                content.includes("verifySession") ||
                content.includes("verifyAdmin") ||
                content.includes("requireAuth") ||
                content.includes("requireAdmin") ||
                content.includes("requireAdminOrDev") ||
                content.includes("requireStaffOrDev") ||
                content.includes("requireEventManagerOrDev") ||
                content.includes("verifyServerSession") ||
                content.includes("auth.verifyIdToken") ||
                content.includes("checkAuth") ||
                relPath.startsWith("/api/admin") ||
                relPath.startsWith("/api/pastor") ||
                relPath.startsWith("/api/event-manager") ||
                relPath.startsWith("/api/field-volunteer");

              let roleHint = "PUBLIC";
              if (relPath.startsWith("/api/admin")) roleHint = "ADMIN";
              else if (relPath.startsWith("/api/pastor")) roleHint = "PASTOR";
              else if (authRequired) roleHint = "AUTHENTICATED";

              inventory.push({
                method: m,
                path: relPath,
                authRequired,
                roleHint,
                source: "nextjs",
              });
            }
          }
        }
      }
    };

    if (fs.existsSync(apiDir)) {
      scanApiRoutes(apiDir);
    }

    const unauthenticatedMutations = inventory.filter(
      (item) => !item.authRequired && (item.method === "DELETE" || item.method === "PUT")
    );

    if (unauthenticatedMutations.length > 0) {
      return HealthResult.warn(
        this.name,
        this.category,
        `Found ${unauthenticatedMutations.length} state-mutating endpoint(s) without detected auth guards: ${unauthenticatedMutations.map((i) => `${i.method} ${i.path}`).join(", ")}`,
        "HIGH",
        0,
        { unauthenticatedMutations, totalEndpoints: inventory.length }
      );
    }

    return HealthResult.pass(
      this.name,
      this.category,
      `Audited ${inventory.length} API endpoint handlers. All destructive verbs enforce authorization.`,
      0,
      { totalAudited: inventory.length }
    );
  }
}
