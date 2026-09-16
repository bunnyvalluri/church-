/**
 * health/security/SecretScanHealthCheck.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Scans codebase for exposed private keys, database URIs, API tokens, and secrets.
 * Strictly masks all sensitive content.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import fs from "fs";
import path from "path";
import { BaseHealthCheck } from "../core/HealthCheck";
import { HealthResult } from "../core/HealthResult";
import { HealthCategoryType, HealthContext } from "../config/health.types";

interface SecretFinding {
  type: string;
  file: string;
  line: number;
}

export class SecretScanHealthCheck extends BaseHealthCheck {
  public readonly name = "Static Codebase Secret & Credential Leakage Scan";
  public readonly category: HealthCategoryType = "security";
  public readonly defaultSeverity = "CRITICAL";

  protected async execute(context: HealthContext): Promise<HealthResult> {
    const findings: SecretFinding[] = [];

    const patterns = [
      { type: "Private Key", regex: /-----BEGIN\s+(?:RSA\s+)?PRIVATE\s+KEY-----/gi },
      { type: "PostgreSQL Connection String with Credentials", regex: /postgres(?:ql)?:\/\/[A-Za-z0-9_]+:[^@\s"']{3,}@[A-Za-z0-9_.-]+/gi },
      { type: "MongoDB Connection String with Credentials", regex: /mongodb(?:\+srv)?:\/\/[A-Za-z0-9_]+:[^@\s"']{3,}@[A-Za-z0-9_.-]+/gi },
      { type: "Live Stripe Secret Key", regex: /sk_live_[a-zA-Z0-9]{24,}/g },
      { type: "Live Razorpay Secret Key", regex: /rzp_live_[a-zA-Z0-9]{20,}/g },
    ];

    const scanDir = (dir: string) => {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      for (const e of entries) {
        const full = path.join(dir, e.name);
        if (
          e.isDirectory() &&
          e.name !== "node_modules" &&
          e.name !== ".next" &&
          e.name !== ".git" &&
          e.name !== "docs" &&
          e.name !== "reports"
        ) {
          scanDir(full);
        } else if (
          e.isFile() &&
          (e.name.endsWith(".ts") ||
            e.name.endsWith(".tsx") ||
            e.name.endsWith(".js") ||
            e.name.endsWith(".jsx"))
        ) {
          const content = fs.readFileSync(full, "utf-8");
          const lines = content.split("\n");

          for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            for (const p of patterns) {
              p.regex.lastIndex = 0;
              if (p.regex.test(line)) {
                // Ignore scanner/health scripts themselves
                if (full.includes("SecretScanHealthCheck") || full.includes("scan_production_bundle")) continue;
                findings.push({
                  type: p.type,
                  file: path.relative(context.workspaceRoot, full),
                  line: i + 1,
                });
              }
            }
          }
        }
      }
    };

    scanDir(context.frontendPath);
    scanDir(context.backendPath);

    if (findings.length > 0) {
      return HealthResult.fail(
        this.name,
        this.category,
        `Detected ${findings.length} hardcoded secret signature(s) in source code: ${findings.map((f) => `${f.type} at ${f.file}:${f.line}`).join(", ")}`,
        "CRITICAL",
        0,
        { findings, recommendation: "Remove hardcoded credentials and replace with environment variables." }
      );
    }

    return HealthResult.pass(
      this.name,
      this.category,
      "Zero hardcoded private keys, database credentials, or live API secrets detected in source code.",
      0
    );
  }
}
