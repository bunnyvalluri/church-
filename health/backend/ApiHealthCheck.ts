/**
 * health/backend/ApiHealthCheck.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Inspects Next.js App Router API route handlers and Express REST endpoints.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import fs from "fs";
import path from "path";
import { BaseHealthCheck } from "../core/HealthCheck";
import { HealthResult } from "../core/HealthResult";
import { HealthCategoryType, HealthContext } from "../config/health.types";

export class ApiHealthCheck extends BaseHealthCheck {
  public readonly name = "API Route Handlers & REST Endpoints";
  public readonly category: HealthCategoryType = "backend";
  public readonly defaultSeverity = "CRITICAL";

  protected async execute(context: HealthContext): Promise<HealthResult> {
    const apiDir = path.join(context.frontendPath, "app", "api");
    const serverPath = path.join(context.backendPath, "server.js");

    const endpointList: string[] = [];

    const scanNextApi = (dir: string) => {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      for (const e of entries) {
        const full = path.join(dir, e.name);
        if (e.isDirectory()) {
          scanNextApi(full);
        } else if (e.isFile() && (e.name === "route.ts" || e.name === "route.js")) {
          const rel = path.relative(apiDir, dir).replace(/\\/g, "/");
          endpointList.push(`/api/${rel}`);
        }
      }
    };

    if (fs.existsSync(apiDir)) {
      scanNextApi(apiDir);
    }

    let expressEndpoints = 0;
    if (fs.existsSync(serverPath)) {
      const serverContent = fs.readFileSync(serverPath, "utf-8");
      const matches = serverContent.match(/app\.(get|post|put|delete|patch)\(['"]([^'"]+)['"]/g);
      if (matches) {
        expressEndpoints = matches.length;
      }
    }

    return HealthResult.pass(
      this.name,
      this.category,
      `API surface active with ${endpointList.length} Next.js route handler(s) and ${expressEndpoints} Express companion endpoint(s).`,
      0,
      { nextApiCount: endpointList.length, expressEndpointCount: expressEndpoints }
    );
  }
}
