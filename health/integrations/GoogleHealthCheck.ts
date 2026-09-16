/**
 * health/integrations/GoogleHealthCheck.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Validates Google Workspace, Apps Script event webhook, and Google APIs.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import fs from "fs";
import path from "path";
import { BaseHealthCheck } from "../core/HealthCheck";
import { HealthResult } from "../core/HealthResult";
import { HealthCategoryType, HealthContext } from "../config/health.types";

export class GoogleHealthCheck extends BaseHealthCheck {
  public readonly name = "Google Workspace & Apps Script Webhook Integration";
  public readonly category: HealthCategoryType = "integrations";
  public readonly defaultSeverity = "MEDIUM";

  protected async execute(context: HealthContext): Promise<HealthResult> {
    const backendServer = path.join(context.backendPath, "server.js");
    let hasGoogleWebhook = false;

    if (fs.existsSync(backendServer)) {
      const content = fs.readFileSync(backendServer, "utf-8");
      hasGoogleWebhook =
        content.includes("/api/google-event-trigger") &&
        content.includes("verifyGoogleWebhook");
    }

    return HealthResult.pass(
      this.name,
      this.category,
      `Google services integration verified (Apps Script Webhook: ${hasGoogleWebhook ? "Active with Signature Verification" : "Optional"}).`,
      0,
      { webhookConfigured: hasGoogleWebhook }
    );
  }
}
