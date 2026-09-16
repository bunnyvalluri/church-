/**
 * health/reports/JsonReporter.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Formats HealthReport into clean, formatted JSON.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { HealthReportData } from "../config/health.types";

export class JsonReporter {
  public static format(report: HealthReportData): string {
    return JSON.stringify(report, null, 2);
  }
}
