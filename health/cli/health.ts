#!/usr/bin/env node
/**
 * health/cli/health.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Command-Line Interface for the centralized KCM Health Engine.
 * Supports targeted category checks, severity filtering, and multi-format reports.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import fs from "fs";
import path from "path";
import { HealthEngine } from "../core/HealthEngine";
import { HealthRegistry } from "../core/HealthRegistry";
import { registerAllChecks } from "../core/registerAllChecks";
import { ReportGenerator } from "../reports/ReportGenerator";
import { HealthCategoryType, HealthSeverityType } from "../config/health.types";

// Load local environment files into process.env for CLI diagnostic context
const rootDir = path.resolve(__dirname, "../..");
const envLocalPath = path.join(rootDir, ".env.local");
const envPath = path.join(rootDir, ".env");

function loadEnvFile(filePath: string) {
  if (fs.existsSync(filePath)) {
    const lines = fs.readFileSync(filePath, "utf-8").split("\n");
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eqIdx = trimmed.indexOf("=");
      if (eqIdx > 0) {
        const key = trimmed.slice(0, eqIdx).trim();
        let val = trimmed.slice(eqIdx + 1).trim();
        if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
          val = val.slice(1, -1);
        }
        if (!process.env[key]) {
          process.env[key] = val;
        }
      }
    }
  }
}

loadEnvFile(envLocalPath);
loadEnvFile(envPath);

async function main() {
  const args = process.argv.slice(2);

  let category: HealthCategoryType | undefined;
  let severityThreshold: HealthSeverityType | undefined;
  let autoFix = false;
  let verbose = false;
  let timeoutMs: number | undefined;

  for (const arg of args) {
    if (arg.startsWith("--category=")) {
      category = arg.split("=")[1] as HealthCategoryType;
    } else if (arg.startsWith("--severity=")) {
      severityThreshold = arg.split("=")[1].toUpperCase() as HealthSeverityType;
    } else if (arg === "--autofix" || arg === "-f") {
      autoFix = true;
    } else if (arg === "--verbose" || arg === "-v") {
      verbose = true;
    } else if (arg.startsWith("--timeout=")) {
      timeoutMs = parseInt(arg.split("=")[1], 10);
    } else if (!arg.startsWith("-")) {
      // Positional category argument (e.g. 'health frontend')
      const lower = arg.toLowerCase();
      if (lower !== "all") {
        category = lower as HealthCategoryType;
      }
    }
  }

  console.log("\n============================================================");
  console.log("  KINGDOM OF CHRIST MINISTRIES — PLATFORM HEALTH ENGINE");
  console.log("============================================================\n");

  if (category) {
    console.log(`Targeting Category: [${category.toUpperCase()}]`);
  } else {
    console.log("Targeting: [ALL CATEGORIES]");
  }

  // Initialize and populate registry
  const registry = HealthRegistry.getInstance();
  registerAllChecks(registry);

  console.log(`Loaded ${registry.count} specialized diagnostic health checks.\n`);

  const engine = new HealthEngine(registry, {
    category,
    severityThreshold,
    autoFix,
    verbose,
    timeoutMs,
  });

  const report = await engine.run({
    category,
    severityThreshold,
    autoFix,
    verbose,
    timeoutMs,
  });

  const generator = new ReportGenerator();
  const saved = generator.save(report);

  // Console Output
  const summary = report.summary;

  console.log("------------------------------------------------------------");
  console.log("  EXECUTION SUMMARY");
  console.log("------------------------------------------------------------");
  console.log(`Overall Status:   ${summary.overallStatus}`);
  console.log(`Total Checks:     ${summary.totalChecks}`);
  console.log(`Passed:           ${summary.passedChecks}`);
  console.log(`Warnings:         ${summary.warnedChecks}`);
  console.log(`Failed:           ${summary.failedChecks}`);
  console.log(`Skipped:          ${summary.skippedChecks}`);
  console.log(`Critical Errors:  ${summary.criticalFailures}`);
  console.log(`Duration:         ${summary.durationMs}ms`);
  console.log("------------------------------------------------------------\n");

  console.log("Category Rollups:");
  for (const [catName, cat] of Object.entries(summary.categories)) {
    if (category && catName !== category) continue;
    const badge =
      cat.status === "PASS"
        ? "✓ PASS"
        : cat.status === "WARN"
        ? "⚠ WARN"
        : cat.status === "FAIL"
        ? "✗ FAIL"
        : "○ " + cat.status;
    console.log(`  ${catName.padEnd(16)} : [${badge.padEnd(6)}] (Passed: ${cat.passed}/${cat.total}, Failed: ${cat.failed})`);
  }
  console.log("");

  if (report.recommendations.length > 0) {
    console.log("Actionable Advisories & Recommendations:");
    for (const rec of report.recommendations) {
      console.log(`  • [${rec.severity}] ${rec.name}: ${rec.message}`);
      console.log(`    Recommendation: ${rec.recommendation}\n`);
    }
  }

  console.log(`Reports successfully generated:`);
  console.log(`  JSON:     ${saved.jsonPath}`);
  console.log(`  Markdown: ${saved.markdownPath}`);
  console.log(`  HTML:     ${saved.htmlPath}`);
  console.log("============================================================\n");

  if (summary.criticalFailures > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

main().catch((err) => {
  console.error("Fatal error in health CLI execution:", err);
  process.exit(1);
});
