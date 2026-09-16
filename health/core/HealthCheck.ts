/**
 * health/core/HealthCheck.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Abstract BaseHealthCheck implementing HealthCheckInterface with SOLID principles,
 * timeout management, duration measurement, and robust error boundaries.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import {
  HealthCheckInterface,
  HealthCategoryType,
  HealthSeverityType,
  HealthContext,
  HealthResultData,
} from "../config/health.types";
import { HealthResult } from "./HealthResult";

export abstract class BaseHealthCheck implements HealthCheckInterface {
  public abstract readonly name: string;
  public abstract readonly category: HealthCategoryType;
  public readonly defaultSeverity: HealthSeverityType = "MEDIUM";
  public readonly timeoutMs: number = 5000;
  public readonly canAutoFix: boolean = false;

  /**
   * Subclasses implement execute() containing the specific inspection logic.
   */
  protected abstract execute(context: HealthContext): Promise<HealthResult>;

  /**
   * Template method executing the check with timeout bounds and error insulation.
   */
  public async run(context: HealthContext): Promise<HealthResultData> {
    const startTime = Date.now();
    const effectiveTimeout = context.options.timeoutMs || this.timeoutMs;

    try {
      const timeoutPromise = new Promise<HealthResult>((_, reject) =>
        setTimeout(
          () =>
            reject(
              new Error(
                `Health check '${this.name}' exceeded timeout of ${effectiveTimeout}ms`
              )
            ),
          effectiveTimeout
        )
      );

      const checkPromise = this.execute(context);
      const result = await Promise.race([checkPromise, timeoutPromise]);
      const durationMs = Date.now() - startTime;

      return new HealthResult({
        ...result.toJSON(),
        durationMs,
      }).toJSON();
    } catch (err: unknown) {
      const durationMs = Date.now() - startTime;
      const errorMsg = err instanceof Error ? err.message : String(err);

      return HealthResult.fail(
        this.name,
        this.category,
        `Execution failed: ${errorMsg}`,
        this.defaultSeverity,
        durationMs,
        undefined,
        errorMsg
      ).toJSON();
    }
  }

  public async autoFix?(
    _context: HealthContext
  ): Promise<{ fixed: boolean; message: string }> {
    return { fixed: false, message: "Auto-fix not supported for this check" };
  }
}
