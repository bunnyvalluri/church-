/**
 * health/core/HealthReport.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Aggregate HealthReport model compiling check execution data into
 * structured summaries, category rollups, and actionable recommendations.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import {
  HealthReportData,
  HealthReportSummary,
  HealthResultData,
  HealthStatusType,
  HealthCategoryType,
  CategorySummary,
} from "../config/health.types";
import { defaultHealthConfig } from "../config/health.config";

export class HealthReport implements HealthReportData {
  public readonly summary: HealthReportSummary;
  public readonly results: HealthResultData[];
  public readonly recommendations: Array<{
    name: string;
    category: HealthCategoryType;
    severity: HealthResultData["severity"];
    message: string;
    recommendation: string;
  }>;

  constructor(results: HealthResultData[], durationMs: number) {
    this.results = results;
    this.summary = this.calculateSummary(results, durationMs);
    this.recommendations = this.extractRecommendations(results);
  }

  private calculateSummary(
    results: HealthResultData[],
    durationMs: number
  ): HealthReportSummary {
    const categories: Record<HealthCategoryType, CategorySummary> = {} as Record<
      HealthCategoryType,
      CategorySummary
    >;

    for (const cat of defaultHealthConfig.categories) {
      categories[cat] = {
        category: cat,
        status: "PASS",
        total: 0,
        passed: 0,
        warned: 0,
        failed: 0,
        skipped: 0,
        unknown: 0,
        criticalCount: 0,
        highCount: 0,
        mediumCount: 0,
        lowCount: 0,
      };
    }

    let passedChecks = 0;
    let warnedChecks = 0;
    let failedChecks = 0;
    let skippedChecks = 0;
    let unknownChecks = 0;
    let criticalFailures = 0;
    let highFailures = 0;

    for (const r of results) {
      const cat = categories[r.category];
      if (cat) {
        cat.total++;
        if (r.status === "PASS") cat.passed++;
        else if (r.status === "WARN") cat.warned++;
        else if (r.status === "FAIL") cat.failed++;
        else if (r.status === "SKIPPED") cat.skipped++;
        else cat.unknown++;

        if (r.severity === "CRITICAL") cat.criticalCount++;
        else if (r.severity === "HIGH") cat.highCount++;
        else if (r.severity === "MEDIUM") cat.mediumCount++;
        else if (r.severity === "LOW") cat.lowCount++;
      }

      if (r.status === "PASS") passedChecks++;
      else if (r.status === "WARN") warnedChecks++;
      else if (r.status === "FAIL") {
        failedChecks++;
        if (r.severity === "CRITICAL") criticalFailures++;
        if (r.severity === "HIGH") highFailures++;
      } else if (r.status === "SKIPPED") skippedChecks++;
      else unknownChecks++;
    }

    // Determine category rollup status
    for (const cat of Object.values(categories)) {
      if (cat.criticalCount > 0 || cat.failed > 0) {
        cat.status = "FAIL";
      } else if (cat.warned > 0) {
        cat.status = "WARN";
      } else if (cat.total > 0 && cat.passed === cat.total) {
        cat.status = "PASS";
      } else if (cat.total > 0 && cat.skipped === cat.total) {
        cat.status = "SKIPPED";
      } else {
        cat.status = cat.total === 0 ? "SKIPPED" : "UNKNOWN";
      }
    }

    // Determine overall status
    let overallStatus: HealthStatusType = "PASS";
    if (criticalFailures > 0 || failedChecks > 0) {
      overallStatus = "FAIL";
    } else if (warnedChecks > 0) {
      overallStatus = "WARN";
    }

    return {
      overallStatus,
      totalChecks: results.length,
      passedChecks,
      warnedChecks,
      failedChecks,
      skippedChecks,
      unknownChecks,
      criticalFailures,
      highFailures,
      durationMs,
      generatedAt: new Date().toISOString(),
      categories,
    };
  }

  private extractRecommendations(
    results: HealthResultData[]
  ): Array<{
    name: string;
    category: HealthCategoryType;
    severity: HealthResultData["severity"];
    message: string;
    recommendation: string;
  }> {
    const recs: Array<{
      name: string;
      category: HealthCategoryType;
      severity: HealthResultData["severity"];
      message: string;
      recommendation: string;
    }> = [];

    for (const r of results) {
      if (r.status === "FAIL" || r.status === "WARN") {
        const recommendation =
          r.metadata?.recommendation ||
          (r.status === "FAIL"
            ? `Resolve root cause for failure in check '${r.name}'.`
            : `Review warning advisory for check '${r.name}'.`);

        recs.push({
          name: r.name,
          category: r.category,
          severity: r.severity,
          message: r.message,
          recommendation,
        });
      }
    }

    return recs;
  }

  toJSON(): HealthReportData {
    return {
      summary: this.summary,
      results: this.results,
      recommendations: this.recommendations,
    };
  }
}
