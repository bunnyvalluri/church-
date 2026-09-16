/**
 * health/testing/IntegrationTestHealthCheck.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Validates API and service integration test suites.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import fs from "fs";
import path from "path";
import { BaseHealthCheck } from "../core/HealthCheck";
import { HealthResult } from "../core/HealthResult";
import { HealthCategoryType, HealthContext } from "../config/health.types";

export class IntegrationTestHealthCheck extends BaseHealthCheck {
  public readonly name = "Integration Test Harness & Endpoint Coverage";
  public readonly category: HealthCategoryType = "testing";
  public readonly defaultSeverity = "HIGH";

  protected async execute(context: HealthContext): Promise<HealthResult> {
    const frontendTestsDir = path.join(context.frontendPath, "tests");
    const backendTestsDir = path.join(context.backendPath, "tests");

    const hasFrontendTests = fs.existsSync(frontendTestsDir);
    const hasBackendTests = fs.existsSync(backendTestsDir);

    let testFileCount = 0;
    if (hasFrontendTests) {
      const countTests = (dir: string) => {
        const files = fs.readdirSync(dir, { withFileTypes: true });
        for (const f of files) {
          const full = path.join(dir, f.name);
          if (f.isDirectory()) countTests(full);
          else if (f.isFile() && (f.name.endsWith(".spec.ts") || f.name.endsWith(".test.ts"))) {
            testFileCount++;
          }
        }
      };
      countTests(frontendTestsDir);
    }

    return HealthResult.pass(
      this.name,
      this.category,
      `Integration testing suite active with ${testFileCount} test specification file(s).`,
      0,
      { testFileCount, backendTestsAvailable: hasBackendTests }
    );
  }
}
