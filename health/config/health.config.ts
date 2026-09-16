/**
 * health/config/health.config.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Central configuration values, thresholds, SLAs, and rules for Health Checks.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import path from "path";
import { HealthCategoryType, HealthSeverityType } from "./health.types";

export interface HealthConfig {
  workspaceRoot: string;
  frontendPath: string;
  backendPath: string;
  reportsPath: string;
  defaultTimeoutMs: number;
  criticalTimeoutMs: number;
  performanceThresholds: {
    maxLcpMs: number;
    maxInpMs: number;
    maxCls: number;
    maxClientBundleChunkKb: number;
    maxTotalClientBundleMb: number;
    maxApiResponseMs: number;
    maxDbQueryMs: number;
  };
  securityRules: {
    maskSecrets: boolean;
    disallowWildcardCorsInProd: boolean;
    requiredSecurityHeaders: string[];
  };
  categories: HealthCategoryType[];
  severities: HealthSeverityType[];
}

const workspaceRoot = path.resolve(__dirname, "../..");

export const defaultHealthConfig: HealthConfig = {
  workspaceRoot,
  frontendPath: path.join(workspaceRoot, "frontend"),
  backendPath: path.join(workspaceRoot, "backend"),
  reportsPath: path.join(workspaceRoot, "reports"),
  defaultTimeoutMs: 5000,
  criticalTimeoutMs: 15000,
  performanceThresholds: {
    maxLcpMs: 2500,
    maxInpMs: 200,
    maxCls: 0.1,
    maxClientBundleChunkKb: 350,
    maxTotalClientBundleMb: 6.5,
    maxApiResponseMs: 500,
    maxDbQueryMs: 200,
  },
  securityRules: {
    maskSecrets: true,
    disallowWildcardCorsInProd: true,
    requiredSecurityHeaders: [
      "X-Frame-Options",
      "X-Content-Type-Options",
      "Strict-Transport-Security",
      "Referrer-Policy",
    ],
  },
  categories: [
    "frontend",
    "backend",
    "auth",
    "database",
    "security",
    "integrations",
    "infrastructure",
    "observability",
    "testing",
    "performance",
  ],
  severities: ["INFO", "LOW", "MEDIUM", "HIGH", "CRITICAL"],
};
