/**
 * health/reports/MarkdownReporter.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Formats HealthReport into a GitHub-Flavored Markdown summary.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { HealthReportData, HealthResultData } from "../config/health.types";

export class MarkdownReporter {
  public static format(report: HealthReportData): string {
    const { summary, results, recommendations } = report;

    const statusBadge = (s: string) => {
      switch (s) {
        case "PASS":
          return "🟢 PASS";
        case "WARN":
          return "🟡 WARN";
        case "FAIL":
          return "🔴 FAIL";
        case "SKIPPED":
          return "⚪ SKIPPED";
        default:
          return "🟣 UNKNOWN";
      }
    };

    let md = `# Kingdom of Christ Ministries — Platform Health Audit Report\n\n`;
    md += `**Generated At**: ${summary.generatedAt}  \n`;
    md += `**Execution Time**: ${summary.durationMs}ms  \n`;
    md += `**Overall Status**: ${statusBadge(summary.overallStatus)}  \n\n`;

    md += `## 1. Executive Summary\n\n`;
    md += `| Total Checks | Passed | Warnings | Failed | Skipped | Unknown | Critical Failures |\n`;
    md += `|---|---|---|---|---|---|---|\n`;
    md += `| ${summary.totalChecks} | ${summary.passedChecks} | ${summary.warnedChecks} | ${summary.failedChecks} | ${summary.skippedChecks} | ${summary.unknownChecks} | ${summary.criticalFailures} |\n\n`;

    md += `## 2. Category Rollups\n\n`;
    md += `| Category | Status | Total | Passed | Warned | Failed | Skipped | Critical |\n`;
    md += `|---|---|---|---|---|---|---|---|\n`;

    for (const [catName, cat] of Object.entries(summary.categories)) {
      md += `| **${catName.toUpperCase()}** | ${statusBadge(cat.status)} | ${cat.total} | ${cat.passed} | ${cat.warned} | ${cat.failed} | ${cat.skipped} | ${cat.criticalCount} |\n`;
    }
    md += `\n`;

    if (recommendations.length > 0) {
      md += `## 3. Actionable Recommendations & Advisories\n\n`;
      for (const rec of recommendations) {
        md += `### [${rec.severity}] ${rec.name} (${rec.category})\n`;
        md += `- **Message**: ${rec.message}\n`;
        md += `- **Remediation**: ${rec.recommendation}\n\n`;
      }
    }

    md += `## 4. Complete Check Inventory\n\n`;
    md += `| Category | Check Name | Status | Severity | Duration | Summary |\n`;
    md += `|---|---|---|---|---|---|\n`;

    for (const r of results) {
      md += `| ${r.category} | ${r.name} | ${statusBadge(r.status)} | ${r.severity} | ${r.durationMs}ms | ${r.message.replace(/\|/g, "\\|")} |\n`;
    }
    md += `\n---\n*Report compiled by KCM Centralized Health Engine.*\n`;

    return md;
  }
}
