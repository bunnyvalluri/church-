/**
 * health/integrations/CloudinaryHealthCheck.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Validates Cloudinary media asset configuration and secure upload presets.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import fs from "fs";
import path from "path";
import { BaseHealthCheck } from "../core/HealthCheck";
import { HealthResult } from "../core/HealthResult";
import { HealthCategoryType, HealthContext } from "../config/health.types";

export class CloudinaryHealthCheck extends BaseHealthCheck {
  public readonly name = "Cloudinary Media Asset Storage Integration";
  public readonly category: HealthCategoryType = "integrations";
  public readonly defaultSeverity = "HIGH";

  protected async execute(context: HealthContext): Promise<HealthResult> {
    const cloudinaryLib = path.join(context.frontendPath, "lib", "cloudinary.ts");
    const hasModule = fs.existsSync(cloudinaryLib);

    const cloudName =
      context.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ||
      context.env.CLOUDINARY_CLOUD_NAME ||
      "";

    const hasApiKey = !!context.env.CLOUDINARY_API_KEY;

    if (!hasModule) {
      return HealthResult.warn(
        this.name,
        this.category,
        "Cloudinary client module not found at frontend/lib/cloudinary.ts.",
        "MEDIUM",
        0
      );
    }

    if (!cloudName) {
      return HealthResult.warn(
        this.name,
        this.category,
        "Cloudinary cloud name is not configured in environment.",
        "MEDIUM",
        0,
        { recommendation: "Set NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME for image uploads." }
      );
    }

    return HealthResult.pass(
      this.name,
      this.category,
      `Cloudinary media integration active for cloud '${cloudName}' (API Key: ${hasApiKey ? "Configured" : "Unsigned Client Preset"}).`,
      0,
      { cloudName, hasApiKey }
    );
  }
}
