/**
 * health/tests/health-engine.test.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Comprehensive test suite validating the Health Engine itself:
 * - Check execution
 * - Timeout handling
 * - Secret redaction
 * - Error isolation (one failure does not crash the engine)
 * - Multi-format report generation
 * - Status classification
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { HealthEngine } from "../core/HealthEngine";
import { HealthRegistry } from "../core/HealthRegistry";
import { BaseHealthCheck } from "../core/HealthCheck";
import { HealthResult } from "../core/HealthResult";
import { HealthCategoryType, HealthContext } from "../config/health.types";
import { ReportGenerator } from "../reports/ReportGenerator";
import fs from "fs";
import path from "path";

// 1. Mock Passing Check
class MockPassCheck extends BaseHealthCheck {
  public readonly name = "Mock Pass Check";
  public readonly category: HealthCategoryType = "frontend";
  protected async execute(): Promise<HealthResult> {
    return HealthResult.pass(this.name, this.category, "Everything is fine");
  }
}

// 2. Mock Failing Check
class MockFailCheck extends BaseHealthCheck {
  public readonly name = "Mock Fail Check";
  public readonly category: HealthCategoryType = "security";
  public readonly defaultSeverity = "CRITICAL";
  protected async execute(): Promise<HealthResult> {
    return HealthResult.fail(
      this.name,
      this.category,
      "Simulated security breach",
      "CRITICAL"
    );
  }
}

// 3. Mock Check Exposing Secrets (tests automatic redaction)
class MockSecretLeakCheck extends BaseHealthCheck {
  public readonly name = "Mock Secret Leak Check";
  public readonly category: HealthCategoryType = "database";
  protected async execute(): Promise<HealthResult> {
    return HealthResult.warn(
      this.name,
      this.category,
      "Connection failed to postgresql://user:super_secret_password_123@db.neon.tech/main with key sk-live_1234567890abcdef12345678"
    );
  }
}

// 4. Mock Crashing Check (throws unhandled error)
class MockCrashCheck extends BaseHealthCheck {
  public readonly name = "Mock Crash Check";
  public readonly category: HealthCategoryType = "backend";
  protected async execute(): Promise<HealthResult> {
    throw new Error("Simulated catastrophic crash in check execution");
  }
}

// 5. Mock Slow Check (tests timeout cancellation)
class MockSlowCheck extends BaseHealthCheck {
  public readonly name = "Mock Slow Check";
  public readonly category: HealthCategoryType = "performance";
  public readonly timeoutMs = 150; // Short timeout for test
  protected async execute(): Promise<HealthResult> {
    await new Promise((resolve) => setTimeout(resolve, 800));
    return HealthResult.pass(this.name, this.category, "Finished late");
  }
}

async function runHealthTests() {
  console.log("==================================================");
  console.log("  RUNNING HEALTH SYSTEM SELF-TEST SUITE");
  console.log("==================================================\n");

  let passedTests = 0;
  let failedTests = 0;

  function assert(condition: boolean, testName: string) {
    if (condition) {
      console.log(`  ✓ PASS: ${testName}`);
      passedTests++;
    } else {
      console.error(`  ✗ FAIL: ${testName}`);
      failedTests++;
    }
  }

  const registry = new HealthRegistry();
  registry.register(new MockPassCheck());
  registry.register(new MockFailCheck());
  registry.register(new MockSecretLeakCheck());
  registry.register(new MockCrashCheck());
  registry.register(new MockSlowCheck());

  assert(registry.count === 5, "HealthRegistry registers all checks correctly");

  const engine = new HealthEngine(registry);
  const report = await engine.run();

  // Test 1: Health checks execute
  assert(report.results.length === 5, "All registered checks executed");

  // Test 2: Failed checks detected
  const failResult = report.results.find((r) => r.name === "Mock Fail Check");
  assert(failResult !== undefined && failResult.status === "FAIL", "Failed checks are accurately detected");
  assert(failResult?.severity === "CRITICAL", "Critical severity is correctly classified");

  // Test 3: Unhandled exception does not crash engine
  const crashResult = report.results.find((r) => r.name === "Mock Crash Check");
  assert(
    crashResult !== undefined && crashResult.status === "FAIL",
    "Engine error boundary catches unhandled exceptions and converts to FAIL"
  );

  // Test 4: Timeout mechanism works
  const timeoutResult = report.results.find((r) => r.name === "Mock Slow Check");
  assert(
    timeoutResult !== undefined && timeoutResult.message.includes("exceeded timeout"),
    "Slow checks cleanly time out without hanging the engine"
  );

  // Test 5: Secret redaction works
  const secretResult = report.results.find((r) => r.name === "Mock Secret Leak Check");
  assert(
    secretResult !== undefined &&
      !secretResult.message.includes("super_secret_password_123") &&
      secretResult.message.includes("[REDACTED_PASSWORD]"),
    "Secrets and database passwords are automatically masked"
  );

  // Test 6: Report compilation and rollups
  assert(report.summary.totalChecks === 5, "Report summary total checks count matches");
  assert(report.summary.failedChecks === 3, "Report summary accurately rolls up failures");
  assert(report.summary.overallStatus === "FAIL", "Overall status evaluates to FAIL when critical failure exists");

  // Test 7: Report generator writes valid JSON, MD, and HTML files
  const testOutputDir = path.join(__dirname, "test-output");
  const generator = new ReportGenerator(testOutputDir);
  const saved = generator.save(report);

  assert(fs.existsSync(saved.jsonPath), "JSON report generated and written to disk");
  assert(fs.existsSync(saved.markdownPath), "Markdown report generated and written to disk");
  assert(fs.existsSync(saved.htmlPath), "HTML dashboard generated and written to disk");

  // Clean up test output
  if (fs.existsSync(testOutputDir)) {
    fs.rmSync(testOutputDir, { recursive: true, force: true });
  }

  console.log("\n--------------------------------------------------");
  console.log(`Self-Test Results: ${passedTests} passed, ${failedTests} failed.`);
  console.log("==================================================\n");

  if (failedTests > 0) {
    process.exit(1);
  }
}

runHealthTests().catch((err) => {
  console.error("Fatal error running health self-tests:", err);
  process.exit(1);
});
