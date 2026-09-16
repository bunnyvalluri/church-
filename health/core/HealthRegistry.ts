/**
 * health/core/HealthRegistry.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Dependency injection and catalog registry for all HealthCheck implementations.
 * Supports category filtering, check lookups, and dynamic check registration.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import {
  HealthCheckInterface,
  HealthCategoryType,
  HealthSeverityType,
} from "../config/health.types";

export class HealthRegistry {
  private static instance: HealthRegistry;
  private readonly checks: Map<string, HealthCheckInterface> = new Map();

  public static getInstance(): HealthRegistry {
    if (!HealthRegistry.instance) {
      HealthRegistry.instance = new HealthRegistry();
    }
    return HealthRegistry.instance;
  }

  public register(check: HealthCheckInterface): this {
    if (this.checks.has(check.name)) {
      // Overwrite or update check gracefully
      this.checks.set(check.name, check);
    } else {
      this.checks.set(check.name, check);
    }
    return this;
  }

  public registerAll(checks: HealthCheckInterface[]): this {
    for (const check of checks) {
      this.register(check);
    }
    return this;
  }

  public getCheck(name: string): HealthCheckInterface | undefined {
    return this.checks.get(name);
  }

  public getAll(): HealthCheckInterface[] {
    return Array.from(this.checks.values());
  }

  public getByCategory(category: HealthCategoryType): HealthCheckInterface[] {
    return this.getAll().filter((c) => c.category === category);
  }

  public getByMinSeverity(severity: HealthSeverityType): HealthCheckInterface[] {
    const severities: HealthSeverityType[] = ["INFO", "LOW", "MEDIUM", "HIGH", "CRITICAL"];
    const targetIdx = severities.indexOf(severity);
    return this.getAll().filter((c) => severities.indexOf(c.defaultSeverity) >= targetIdx);
  }

  public clear(): void {
    this.checks.clear();
  }

  public get count(): number {
    return this.checks.size;
  }
}
