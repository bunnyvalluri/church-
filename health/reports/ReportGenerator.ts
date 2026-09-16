/**
 * health/reports/ReportGenerator.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Coordinates writing all report formats (JSON, Markdown, HTML) to disk.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import fs from "fs";
import path from "path";
import { HealthReport } from "../core/HealthReport";
import { JsonReporter } from "./JsonReporter";
import { MarkdownReporter } from "./MarkdownReporter";
import { HtmlReporter } from "./HtmlReporter";
import { defaultHealthConfig } from "../config/health.config";

export interface SavedReports {
  jsonPath: string;
  markdownPath: string;
  htmlPath: string;
}

export class ReportGenerator {
  private readonly outputDir: string;

  constructor(outputDir: string = defaultHealthConfig.reportsPath) {
    this.outputDir = outputDir;
  }

  public save(report: HealthReport): SavedReports {
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true });
    }

    const reportData = report.toJSON();

    const jsonContent = JsonReporter.format(reportData);
    const mdContent = MarkdownReporter.format(reportData);
    const htmlContent = HtmlReporter.format(reportData);

    const jsonPath = path.join(this.outputDir, "health-report.json");
    const markdownPath = path.join(this.outputDir, "health-report.md");
    const htmlPath = path.join(this.outputDir, "health-report.html");

    fs.writeFileSync(jsonPath, jsonContent, "utf-8");
    fs.writeFileSync(markdownPath, mdContent, "utf-8");
    fs.writeFileSync(htmlPath, htmlContent, "utf-8");

    // Also write to workspace root for convenient discovery
    const rootJson = path.join(defaultHealthConfig.workspaceRoot, "health-report.json");
    const rootMd = path.join(defaultHealthConfig.workspaceRoot, "health-report.md");
    const rootHtml = path.join(defaultHealthConfig.workspaceRoot, "health-report.html");

    fs.writeFileSync(rootJson, jsonContent, "utf-8");
    fs.writeFileSync(rootMd, mdContent, "utf-8");
    fs.writeFileSync(rootHtml, htmlContent, "utf-8");

    return { jsonPath, markdownPath, htmlPath };
  }
}
