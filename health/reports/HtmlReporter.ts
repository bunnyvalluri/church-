/**
 * health/reports/HtmlReporter.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Formats HealthReport into an interactive, responsive standalone HTML dashboard.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { HealthReportData } from "../config/health.types";

export class HtmlReporter {
  public static format(report: HealthReportData): string {
    const { summary, results, recommendations } = report;

    const statusColor = (s: string) => {
      switch (s) {
        case "PASS":
          return "#10B981";
        case "WARN":
          return "#F59E0B";
        case "FAIL":
          return "#EF4444";
        case "SKIPPED":
          return "#6B7280";
        default:
          return "#8B5CF6";
      }
    };

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>KCM Platform Health Audit</title>
  <style>
    :root {
      --bg: #0B0F19;
      --card-bg: #111827;
      --border: #1F2937;
      --text: #F9FAFB;
      --text-muted: #9CA3AF;
      --primary: #6366F1;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      background: var(--bg);
      color: var(--text);
      line-height: 1.5;
      padding: 2rem 1rem;
    }
    .container { max-width: 1200px; margin: 0 auto; }
    header { margin-bottom: 2rem; border-bottom: 1px solid var(--border); padding-bottom: 1.5rem; }
    h1 { font-size: 1.875rem; font-weight: 800; }
    .subtitle { color: var(--text-muted); font-size: 0.875rem; margin-top: 0.25rem; }
    .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 1rem; margin-bottom: 2rem; }
    .card {
      background: var(--card-bg);
      border: 1px solid var(--border);
      border-radius: 0.75rem;
      padding: 1.25rem;
    }
    .stat-val { font-size: 2rem; font-weight: 800; }
    .stat-lbl { font-size: 0.75rem; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05em; }
    .badge {
      display: inline-block;
      padding: 0.2rem 0.6rem;
      border-radius: 9999px;
      font-size: 0.75rem;
      font-weight: 700;
      color: white;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 1rem;
      font-size: 0.875rem;
    }
    th, td {
      padding: 0.75rem 1rem;
      text-align: left;
      border-bottom: 1px solid var(--border);
    }
    th { background: #1F2937; color: var(--text-muted); font-weight: 600; }
    tr:hover { background: rgba(255, 255, 255, 0.02); }
    .rec-card {
      background: rgba(239, 68, 68, 0.05);
      border-left: 4px solid #EF4444;
      padding: 1rem;
      margin-bottom: 0.75rem;
      border-radius: 0 0.5rem 0.5rem 0;
    }
    .rec-card.WARN {
      background: rgba(245, 158, 11, 0.05);
      border-left-color: #F59E0B;
    }
  </style>
</head>
<body>
  <div class="container">
    <header>
      <h1>Kingdom of Christ Ministries</h1>
      <p class="subtitle">Platform Diagnostics & Health Audit — ${new Date(summary.generatedAt).toLocaleString()}</p>
    </header>

    <div class="grid">
      <div class="card">
        <div class="stat-lbl">Overall Status</div>
        <div class="stat-val" style="color: ${statusColor(summary.overallStatus)}">${summary.overallStatus}</div>
      </div>
      <div class="card">
        <div class="stat-lbl">Total Checks</div>
        <div class="stat-val">${summary.totalChecks}</div>
      </div>
      <div class="card">
        <div class="stat-lbl">Passed</div>
        <div class="stat-val" style="color: #10B981">${summary.passedChecks}</div>
      </div>
      <div class="card">
        <div class="stat-lbl">Warnings</div>
        <div class="stat-val" style="color: #F59E0B">${summary.warnedChecks}</div>
      </div>
      <div class="card">
        <div class="stat-lbl">Failed</div>
        <div class="stat-val" style="color: #EF4444">${summary.failedChecks}</div>
      </div>
    </div>

    ${
      recommendations.length > 0
        ? `<div class="card" style="margin-bottom: 2rem;">
            <h2 style="font-size: 1.25rem; font-weight: 700; margin-bottom: 1rem;">Actionable Advisories (${recommendations.length})</h2>
            ${recommendations
              .map(
                (r) => `
              <div class="rec-card ${r.severity === "CRITICAL" || r.severity === "HIGH" ? "FAIL" : "WARN"}">
                <div style="font-weight: 700;">[${r.severity}] ${r.name}</div>
                <div style="font-size: 0.875rem; margin: 0.25rem 0;">${r.message}</div>
                <div style="font-size: 0.8rem; color: #9CA3AF;"><strong>Remediation:</strong> ${r.recommendation}</div>
              </div>
            `
              )
              .join("")}
          </div>`
        : ""
    }

    <div class="card">
      <h2 style="font-size: 1.25rem; font-weight: 700; margin-bottom: 1rem;">Category Breakdown</h2>
      <table>
        <thead>
          <tr>
            <th>Category</th>
            <th>Status</th>
            <th>Total</th>
            <th>Passed</th>
            <th>Warned</th>
            <th>Failed</th>
            <th>Skipped</th>
          </tr>
        </thead>
        <tbody>
          ${Object.values(summary.categories)
            .map(
              (c) => `
            <tr>
              <td><strong>${c.category.toUpperCase()}</strong></td>
              <td><span class="badge" style="background: ${statusColor(c.status)}">${c.status}</span></td>
              <td>${c.total}</td>
              <td>${c.passed}</td>
              <td>${c.warned}</td>
              <td>${c.failed}</td>
              <td>${c.skipped}</td>
            </tr>
          `
            )
            .join("")}
        </tbody>
      </table>
    </div>

    <div class="card" style="margin-top: 2rem;">
      <h2 style="font-size: 1.25rem; font-weight: 700; margin-bottom: 1rem;">All Health Checks</h2>
      <table>
        <thead>
          <tr>
            <th>Category</th>
            <th>Check</th>
            <th>Status</th>
            <th>Severity</th>
            <th>Duration</th>
            <th>Message</th>
          </tr>
        </thead>
        <tbody>
          ${results
            .map(
              (r) => `
            <tr>
              <td>${r.category}</td>
              <td>${r.name}</td>
              <td><span class="badge" style="background: ${statusColor(r.status)}">${r.status}</span></td>
              <td>${r.severity}</td>
              <td>${r.durationMs}ms</td>
              <td>${r.message}</td>
            </tr>
          `
            )
            .join("")}
        </tbody>
      </table>
    </div>
  </div>
</body>
</html>`;
  }
}
