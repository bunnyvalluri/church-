/**
 * health/core/HealthStatus.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Health status utility class and constants.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { HealthStatusType, HealthSeverityType } from "../config/health.types";

export class HealthStatus {
  static readonly PASS: HealthStatusType = "PASS";
  static readonly WARN: HealthStatusType = "WARN";
  static readonly FAIL: HealthStatusType = "FAIL";
  static readonly SKIPPED: HealthStatusType = "SKIPPED";
  static readonly UNKNOWN: HealthStatusType = "UNKNOWN";

  static isPassing(status: HealthStatusType): boolean {
    return status === "PASS";
  }

  static isFailure(status: HealthStatusType): boolean {
    return status === "FAIL";
  }

  static isWarning(status: HealthStatusType): boolean {
    return status === "WARN";
  }

  static getBadgeColor(status: HealthStatusType): string {
    switch (status) {
      case "PASS":
        return "#10B981"; // Emerald
      case "WARN":
        return "#F59E0B"; // Amber
      case "FAIL":
        return "#EF4444"; // Red
      case "SKIPPED":
        return "#6B7280"; // Gray
      case "UNKNOWN":
      default:
        return "#8B5CF6"; // Purple
    }
  }

  static getSeverityScore(severity: HealthSeverityType): number {
    switch (severity) {
      case "CRITICAL":
        return 5;
      case "HIGH":
        return 4;
      case "MEDIUM":
        return 3;
      case "LOW":
        return 2;
      case "INFO":
      default:
        return 1;
    }
  }
}
