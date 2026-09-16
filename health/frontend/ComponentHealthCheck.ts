/**
 * health/frontend/ComponentHealthCheck.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Inspects React Server Component (RSC) and Client Component boundaries.
 * Detects client hooks in Server Components without 'use client' directive.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import fs from "fs";
import path from "path";
import { BaseHealthCheck } from "../core/HealthCheck";
import { HealthResult } from "../core/HealthResult";
import { HealthCategoryType, HealthContext } from "../config/health.types";

export class ComponentHealthCheck extends BaseHealthCheck {
  public readonly name = "Server & Client Component Boundaries";
  public readonly category: HealthCategoryType = "frontend";
  public readonly defaultSeverity = "HIGH";

  protected async execute(context: HealthContext): Promise<HealthResult> {
    const appDir = path.join(context.frontendPath, "app");
    const violations: string[] = [];

    const checkDir = (dir: string) => {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory() && entry.name !== "node_modules" && entry.name !== ".next") {
          checkDir(fullPath);
        } else if (entry.isFile() && (entry.name.endsWith(".tsx") || entry.name.endsWith(".jsx"))) {
          const content = fs.readFileSync(fullPath, "utf-8");
          const hasClientHook =
            content.includes("useState(") ||
            content.includes("useEffect(") ||
            content.includes("useRouter(") ||
            content.includes("useSearchParams(");
          const hasUseClient =
            content.startsWith('"use client"') ||
            content.startsWith("'use client'") ||
            content.includes('\n"use client"') ||
            content.includes("\n'use client'");

          if (hasClientHook && !hasUseClient) {
            const rel = path.relative(context.workspaceRoot, fullPath);
            violations.push(rel);
          }
        }
      }
    };

    if (fs.existsSync(appDir)) {
      checkDir(appDir);
    }

    if (violations.length > 0) {
      return HealthResult.fail(
        this.name,
        this.category,
        `Found ${violations.length} component(s) using client hooks without 'use client' directive: ${violations.slice(0, 3).join(", ")}`,
        "HIGH",
        0,
        { violations, recommendation: "Add 'use client' directive at the top of these component files." }
      );
    }

    return HealthResult.pass(
      this.name,
      this.category,
      "All App Router components properly declare client/server boundaries.",
      0
    );
  }
}
