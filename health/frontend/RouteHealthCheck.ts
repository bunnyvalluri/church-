/**
 * health/frontend/RouteHealthCheck.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Validates App Router structure, verifying all mandatory platform routes exist.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import fs from "fs";
import path from "path";
import { BaseHealthCheck } from "../core/HealthCheck";
import { HealthResult } from "../core/HealthResult";
import { HealthCategoryType, HealthContext } from "../config/health.types";

export class RouteHealthCheck extends BaseHealthCheck {
  public readonly name = "Next.js Route Topology & Integrity";
  public readonly category: HealthCategoryType = "frontend";
  public readonly defaultSeverity = "CRITICAL";

  protected async execute(context: HealthContext): Promise<HealthResult> {
    const appDir = path.join(context.frontendPath, "app");

    if (!fs.existsSync(appDir)) {
      return HealthResult.fail(
        this.name,
        this.category,
        "frontend/app directory does not exist",
        "CRITICAL",
        0,
        { file: appDir }
      );
    }

    const requiredRoutes = [
      { name: "Root Public Page", file: "page.tsx" },
      { name: "Root Layout", file: "layout.tsx" },
      { name: "Member Login", file: "login/page.tsx" },
      { name: "Admin Dedicated Login", file: "admin/login/page.tsx" },
      { name: "Pastor Dedicated Login", file: "pastor/login/page.tsx" },
      { name: "Event Manager Dedicated Login", file: "event-manager/login/page.tsx" },
      { name: "Member Portal", file: "member/page.tsx" },
      { name: "Admin Portal", file: "admin/page.tsx" },
      { name: "Pastor Portal", file: "pastor/page.tsx" },
      { name: "Event Manager Portal", file: "event-manager/page.tsx" },
      { name: "Portal Selection", file: "portal-select/page.tsx" },
      { name: "Registration", file: "register/page.tsx" },
      { name: "Forgot Password", file: "forgot-password/page.tsx" },
    ];

    const missingRoutes: string[] = [];

    for (const route of requiredRoutes) {
      const fullPath = path.join(appDir, route.file);
      if (!fs.existsSync(fullPath)) {
        missingRoutes.push(`${route.name} (${route.file})`);
      }
    }

    if (missingRoutes.length > 0) {
      return HealthResult.fail(
        this.name,
        this.category,
        `Missing critical application routes: ${missingRoutes.join(", ")}`,
        "CRITICAL",
        0,
        { missingRoutes, recommendation: "Ensure all core portal and auth routes are implemented." }
      );
    }

    return HealthResult.pass(
      this.name,
      this.category,
      `All ${requiredRoutes.length} critical platform routes verified in Next.js App Router.`,
      0,
      { totalChecked: requiredRoutes.length }
    );
  }
}
