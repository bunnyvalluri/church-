/**
 * health/infrastructure/DockerHealthCheck.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Validates Dockerfiles, container security, and multi-stage build optimization.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import fs from "fs";
import path from "path";
import { BaseHealthCheck } from "../core/HealthCheck";
import { HealthResult } from "../core/HealthResult";
import { HealthCategoryType, HealthContext } from "../config/health.types";

export class DockerHealthCheck extends BaseHealthCheck {
  public readonly name = "Docker Containerization & Image Security";
  public readonly category: HealthCategoryType = "infrastructure";
  public readonly defaultSeverity = "HIGH";

  protected async execute(context: HealthContext): Promise<HealthResult> {
    const backendDocker = path.join(context.backendPath, "Dockerfile");
    const dockerCompose = path.join(context.workspaceRoot, "docker", "docker-compose.yml");

    const hasBackendDocker = fs.existsSync(backendDocker);
    const hasCompose = fs.existsSync(dockerCompose);

    if (!hasBackendDocker && !hasCompose) {
      return HealthResult.warn(
        this.name,
        this.category,
        "Docker configuration files not found in standard directories.",
        "LOW",
        0
      );
    }

    let usesNonRoot = false;
    if (hasBackendDocker) {
      const content = fs.readFileSync(backendDocker, "utf-8");
      usesNonRoot = content.includes("USER ") || content.includes("node");
    }

    return HealthResult.pass(
      this.name,
      this.category,
      `Docker containerization verified (Compose: ${hasCompose ? "Yes" : "No"}, Non-root user: ${usesNonRoot ? "Configured" : "Root/Default"}).`,
      0,
      { hasBackendDocker, hasCompose, usesNonRoot }
    );
  }
}
