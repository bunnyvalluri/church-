/**
 * health/core/HealthResult.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Concrete Result value object representing the output of a single HealthCheck.
 * Implements automated secret masking and serialization.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import {
  HealthResultData,
  HealthStatusType,
  HealthSeverityType,
  HealthCategoryType,
  HealthCheckMetadata,
} from "../config/health.types";

export class HealthResult implements HealthResultData {
  public readonly name: string;
  public readonly category: HealthCategoryType;
  public readonly status: HealthStatusType;
  public readonly severity: HealthSeverityType;
  public readonly durationMs: number;
  public readonly message: string;
  public readonly timestamp: string;
  public readonly metadata?: HealthCheckMetadata;
  public readonly error?: string;

  constructor(data: HealthResultData) {
    this.name = data.name;
    this.category = data.category;
    this.status = data.status;
    this.severity = data.severity;
    this.durationMs = data.durationMs;
    this.message = HealthResult.maskSecrets(data.message);
    this.timestamp = data.timestamp || new Date().toISOString();
    this.metadata = data.metadata ? HealthResult.sanitizeMetadata(data.metadata) : undefined;
    this.error = data.error ? HealthResult.maskSecrets(data.error) : undefined;
  }

  static pass(
    name: string,
    category: HealthCategoryType,
    message: string,
    durationMs = 0,
    metadata?: HealthCheckMetadata
  ): HealthResult {
    return new HealthResult({
      name,
      category,
      status: "PASS",
      severity: "INFO",
      durationMs,
      message,
      timestamp: new Date().toISOString(),
      metadata,
    });
  }

  static warn(
    name: string,
    category: HealthCategoryType,
    message: string,
    severity: HealthSeverityType = "MEDIUM",
    durationMs = 0,
    metadata?: HealthCheckMetadata
  ): HealthResult {
    return new HealthResult({
      name,
      category,
      status: "WARN",
      severity,
      durationMs,
      message,
      timestamp: new Date().toISOString(),
      metadata,
    });
  }

  static fail(
    name: string,
    category: HealthCategoryType,
    message: string,
    severity: HealthSeverityType = "HIGH",
    durationMs = 0,
    metadata?: HealthCheckMetadata,
    error?: string
  ): HealthResult {
    return new HealthResult({
      name,
      category,
      status: "FAIL",
      severity,
      durationMs,
      message,
      timestamp: new Date().toISOString(),
      metadata,
      error,
    });
  }

  static skipped(
    name: string,
    category: HealthCategoryType,
    message: string,
    durationMs = 0,
    metadata?: HealthCheckMetadata
  ): HealthResult {
    return new HealthResult({
      name,
      category,
      status: "SKIPPED",
      severity: "INFO",
      durationMs,
      message,
      timestamp: new Date().toISOString(),
      metadata,
    });
  }

  static unknown(
    name: string,
    category: HealthCategoryType,
    message: string,
    durationMs = 0,
    metadata?: HealthCheckMetadata,
    error?: string
  ): HealthResult {
    return new HealthResult({
      name,
      category,
      status: "UNKNOWN",
      severity: "LOW",
      durationMs,
      message,
      timestamp: new Date().toISOString(),
      metadata,
      error,
    });
  }

  /**
   * Masks potential API keys, passwords, database URIs, and tokens from strings.
   */
  public static maskSecrets(input: string): string {
    if (!input || typeof input !== "string") return input;

    let sanitized = input;

    // Database URIs
    sanitized = sanitized.replace(
      /(postgres(?:ql)?:\/\/[^:]+:)([^@]+)(@.+)/gi,
      "$1[REDACTED_PASSWORD]$3"
    );
    sanitized = sanitized.replace(
      /(mongodb(?:\+srv)?:\/\/[^:]+:)([^@]+)(@.+)/gi,
      "$1[REDACTED_PASSWORD]$3"
    );

    // API Keys (Stripe, OpenAI, Resend, Anthropic, Google)
    sanitized = sanitized.replace(/sk-[a-zA-Z0-9]{20,}/g, "sk-[REDACTED_KEY]");
    sanitized = sanitized.replace(/re_[a-zA-Z0-9]{20,}/g, "re_[REDACTED_KEY]");
    sanitized = sanitized.replace(/AIzaSy[a-zA-Z0-9_-]{33}/g, "AIzaSy[REDACTED_KEY]");
    sanitized = sanitized.replace(/GOCSPX-[a-zA-Z0-9_-]+/g, "GOCSPX-[REDACTED_KEY]");
    sanitized = sanitized.replace(/rzp_(?:test|live)_[a-zA-Z0-9]+/g, "rzp_[REDACTED_KEY]");

    return sanitized;
  }

  private static sanitizeMetadata(metadata: HealthCheckMetadata): HealthCheckMetadata {
    const clean: HealthCheckMetadata = {};
    for (const [key, val] of Object.entries(metadata)) {
      if (typeof val === "string") {
        clean[key] = HealthResult.maskSecrets(val);
      } else if (val && typeof val === "object" && !Array.isArray(val)) {
        clean[key] = this.sanitizeMetadata(val as HealthCheckMetadata);
      } else {
        clean[key] = val;
      }
    }
    return clean;
  }

  toJSON(): HealthResultData {
    return {
      name: this.name,
      category: this.category,
      status: this.status,
      severity: this.severity,
      durationMs: this.durationMs,
      message: this.message,
      timestamp: this.timestamp,
      metadata: this.metadata,
      error: this.error,
    };
  }
}
