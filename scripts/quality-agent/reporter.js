/**
 * scripts/quality-agent/reporter.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Quality Engineering Report Generator.
 * Emits structured JSON and GitHub Flavored Markdown diagnostic summaries.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import fs from 'fs';
import path from 'path';

/**
 * Formats and saves audit reports to disk.
 */
export function generateQualityReport(reportData, options = {}) {
  const reportsDir = options.reportsDir || path.resolve(process.cwd(), 'reports');
  if (!fs.existsSync(reportsDir)) {
    fs.mkdirSync(reportsDir, { recursive: true });
  }

  const timestamp = new Date().toISOString();
  const jsonReportPath = path.join(reportsDir, 'quality-audit-report.json');
  const mdReportPath = path.join(reportsDir, 'quality-audit-report.md');

  const structuredReport = {
    generatedAt: timestamp,
    status: reportData.status || (reportData.failed === 0 ? 'HEALTHY' : 'ISSUES_DETECTED'),
    summary: {
      totalChecks: reportData.totalChecks || 0,
      passed: reportData.passed || 0,
      failed: reportData.failed || 0,
      fixed: reportData.fixed || 0,
      manualReviewRequired: reportData.manualReviewRequired || 0,
    },
    diagnostics: reportData.diagnostics || [],
    environment: {
      node: process.version,
      platform: process.platform,
      env: process.env.NODE_ENV || 'test',
    },
  };

  fs.writeFileSync(jsonReportPath, JSON.stringify(structuredReport, null, 2), 'utf-8');

  // Build Markdown summary
  let markdown = `# Kingdom of Christ Ministries Quality Engineering Report\n\n`;
  markdown += `**Timestamp**: ${timestamp}  \n`;
  markdown += `**Status**: **${structuredReport.status}**  \n\n`;

  markdown += `## Executive Summary\n\n`;
  markdown += `| Metric | Count |\n`;
  markdown += `| :--- | :---: |\n`;
  markdown += `| Total Checks Run | ${structuredReport.summary.totalChecks} |\n`;
  markdown += `| Passed Checks | ${structuredReport.summary.passed} |\n`;
  markdown += `| Failed Checks | ${structuredReport.summary.failed} |\n`;
  markdown += `| Auto-Fixed Issues | ${structuredReport.summary.fixed} |\n`;
  markdown += `| Issues Requiring Manual Review | ${structuredReport.summary.manualReviewRequired} |\n\n`;

  if (structuredReport.diagnostics.length > 0) {
    markdown += `## Diagnostic Details\n\n`;
    for (const item of structuredReport.diagnostics) {
      markdown += `### ${item.issue || 'Diagnostic Item'}\n`;
      markdown += `- **Root Cause**: ${item.rootCause || 'N/A'}\n`;
      markdown += `- **Severity**: \`${item.severity || 'INFO'}\`\n`;
      markdown += `- **Category**: \`${item.category || 'GENERAL'}\`\n`;
      markdown += `- **Affected Files**: ${item.affectedFiles?.join(', ') || 'N/A'}\n`;
      markdown += `- **Fix Applied**: ${item.fix || 'None'}\n`;
      markdown += `- **Build Status**: ${item.build || 'N/A'}\n`;
      markdown += `- **Recommendation**: ${item.recommendation || 'N/A'}\n\n`;
    }
  } else {
    markdown += `> [!NOTE]\n> All registered routes, typecheck verifications, and quality gates are completely healthy.\n`;
  }

  fs.writeFileSync(mdReportPath, markdown, 'utf-8');

  return { jsonReportPath, mdReportPath, structuredReport };
}
