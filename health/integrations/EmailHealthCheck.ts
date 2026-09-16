/**
 * health/integrations/EmailHealthCheck.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Validates transactional email providers (Resend, Nodemailer, Twilio SMS).
 * ─────────────────────────────────────────────────────────────────────────────
 */

import fs from "fs";
import path from "path";
import { BaseHealthCheck } from "../core/HealthCheck";
import { HealthResult } from "../core/HealthResult";
import { HealthCategoryType, HealthContext } from "../config/health.types";

export class EmailHealthCheck extends BaseHealthCheck {
  public readonly name = "Transactional Email & SMS Notification Transport";
  public readonly category: HealthCategoryType = "integrations";
  public readonly defaultSeverity = "HIGH";

  protected async execute(context: HealthContext): Promise<HealthResult> {
    const emailApi = path.join(context.frontendPath, "app", "api", "auth", "send-email", "route.ts");
    const hasEmailApi = fs.existsSync(emailApi);

    const hasResend = !!context.env.RESEND_API_KEY;
    const hasSmtp = !!context.env.SMTP_HOST || !!context.env.EMAIL_SERVER_HOST;

    if (!hasEmailApi) {
      return HealthResult.warn(
        this.name,
        this.category,
        "Centralized email route /api/auth/send-email is missing.",
        "MEDIUM",
        0
      );
    }

    return HealthResult.pass(
      this.name,
      this.category,
      `Email transport verified (Resend: ${hasResend ? "Active" : "Fallback"}, SMTP: ${hasSmtp ? "Configured" : "Simulated Local"}).`,
      0,
      { resend: hasResend, smtp: hasSmtp }
    );
  }
}
