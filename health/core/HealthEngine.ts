/**
 * health/core/HealthEngine.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Primary execution engine orchestrating registered health checks, concurrency,
 * error boundaries, deterministic auto-fixes, and aggregate report compilation.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import {
  HealthContext,
  HealthCategoryType,
  HealthSeverityType,
  HealthResultData,
} from "../config/health.types";
import { HealthRegistry } from "./HealthRegistry";
import { HealthReport } from "./HealthReport";
import { defaultHealthConfig } from "../config/health.config";

export interface HealthEngineOptions {
  category?: HealthCategoryType;
  severityThreshold?: HealthSeverityType;
  autoFix?: boolean;
  verbose?: boolean;
  timeoutMs?: number;
  concurrency?: number;
}

export class HealthEngine {
  private readonly registry: HealthRegistry;
  private readonly defaultContext: HealthContext;

  constructor(
    registry: HealthRegistry = HealthRegistry.getInstance(),
    contextOptions: HealthEngineOptions = {}
  ) {
    this.registry = registry;
    this.defaultContext = {
      workspaceRoot: defaultHealthConfig.workspaceRoot,
      frontendPath: defaultHealthConfig.frontendPath,
      backendPath: defaultHealthConfig.backendPath,
      env: process.env,
      options: {
        timeoutMs: defaultHealthConfig.defaultTimeoutMs,
        ...contextOptions,
      },
    };
  }

  public async run(options: HealthEngineOptions = {}): Promise<HealthReport> {
    const startTime = Date.now();
    const context: HealthContext = {
      ...this.defaultContext,
      options: {
        ...this.defaultContext.options,
        ...options,
      },
    };

    let checks = this.registry.getAll();

    if (context.options.category) {
      checks = checks.filter((c) => c.category === context.options.category);
    }

    if (context.options.severityThreshold) {
      const severities: HealthSeverityType[] = ["INFO", "LOW", "MEDIUM", "HIGH", "CRITICAL"];
      const targetIdx = severities.indexOf(context.options.severityThreshold);
      checks = checks.filter(
        (c) => severities.indexOf(c.defaultSeverity) >= targetIdx
      );
    }

    // Execute checks with controlled concurrency
    const concurrency = options.concurrency || 6;
    const results: HealthResultData[] = [];

    // Execute in batches to prevent event loop starvation
    for (let i = 0; i < checks.length; i += concurrency) {
      const batch = checks.slice(i, i + concurrency);
      const batchPromises = batch.map(async (check) => {
        // Optional deterministic auto-fix step
        if (context.options.autoFix && check.canAutoFix && check.autoFix) {
          try {
            await check.autoFix(context);
          } catch {
            // Ignore autoFix failures and let run() inspect current state
          }
        }

        return check.run(context);
      });

      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults);
    }

    const durationMs = Date.now() - startTime;
    return new HealthReport(results, durationMs);
  }
}
