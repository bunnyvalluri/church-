/**
 * health/config/health.types.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Strict type definitions, enums, and interfaces for the KCM Health System.
 * ─────────────────────────────────────────────────────────────────────────────
 */

export type HealthStatusType = "PASS" | "WARN" | "FAIL" | "SKIPPED" | "UNKNOWN";

export type HealthSeverityType = "INFO" | "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export type HealthCategoryType =
  | "frontend"
  | "backend"
  | "auth"
  | "database"
  | "security"
  | "integrations"
  | "infrastructure"
  | "observability"
  | "testing"
  | "performance";

export interface HealthContext {
  workspaceRoot: string;
  frontendPath: string;
  backendPath: string;
  env: Record<string, string | undefined>;
  options: {
    category?: HealthCategoryType;
    severityThreshold?: HealthSeverityType;
    autoFix?: boolean;
    verbose?: boolean;
    timeoutMs?: number;
  };
}

export interface HealthCheckMetadata {
  file?: string;
  line?: number;
  expected?: string | number | boolean;
  actual?: string | number | boolean;
  recommendation?: string;
  details?: Record<string, unknown>;
  [key: string]: unknown;
}

export interface HealthResultData {
  name: string;
  category: HealthCategoryType;
  status: HealthStatusType;
  severity: HealthSeverityType;
  durationMs: number;
  message: string;
  timestamp: string;
  metadata?: HealthCheckMetadata;
  error?: string;
}

export interface CategorySummary {
  category: HealthCategoryType;
  status: HealthStatusType;
  total: number;
  passed: number;
  warned: number;
  failed: number;
  skipped: number;
  unknown: number;
  criticalCount: number;
  highCount: number;
  mediumCount: number;
  lowCount: number;
}

export interface HealthReportSummary {
  overallStatus: HealthStatusType;
  totalChecks: number;
  passedChecks: number;
  warnedChecks: number;
  failedChecks: number;
  skippedChecks: number;
  unknownChecks: number;
  criticalFailures: number;
  highFailures: number;
  durationMs: number;
  generatedAt: string;
  categories: Record<HealthCategoryType, CategorySummary>;
}

export interface HealthReportData {
  summary: HealthReportSummary;
  results: HealthResultData[];
  recommendations: Array<{
    name: string;
    category: HealthCategoryType;
    severity: HealthSeverityType;
    message: string;
    recommendation: string;
  }>;
}

export interface HealthCheckInterface {
  readonly name: string;
  readonly category: HealthCategoryType;
  readonly defaultSeverity: HealthSeverityType;
  readonly timeoutMs: number;
  run(context: HealthContext): Promise<HealthResultData>;
  readonly canAutoFix?: boolean;
  autoFix?(context: HealthContext): Promise<{ fixed: boolean; message: string }>;
}
