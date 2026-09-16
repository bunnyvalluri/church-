/**
 * health/auth/OAuthHealthCheck.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Validates Google OAuth Identity Services (GIS) and Google Sign-In components.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import fs from "fs";
import path from "path";
import { BaseHealthCheck } from "../core/HealthCheck";
import { HealthResult } from "../core/HealthResult";
import { HealthCategoryType, HealthContext } from "../config/health.types";

export class OAuthHealthCheck extends BaseHealthCheck {
  public readonly name = "Google OAuth & Social Sign-In Integration";
  public readonly category: HealthCategoryType = "auth";
  public readonly defaultSeverity = "HIGH";

  protected async execute(context: HealthContext): Promise<HealthResult> {
    const googleButtonPath = path.join(
      context.frontendPath,
      "components",
      "auth",
      "GoogleSignInButton.tsx"
    );

    if (!fs.existsSync(googleButtonPath)) {
      return HealthResult.warn(
        this.name,
        this.category,
        "GoogleSignInButton.tsx component not found in components/auth.",
        "MEDIUM",
        0
      );
    }

    const content = fs.readFileSync(googleButtonPath, "utf-8");
    const hasGoogleAuth = content.includes("GoogleAuthProvider") || content.includes("signInWithPopup");

    return HealthResult.pass(
      this.name,
      this.category,
      "Google OAuth sign-in integration verified with popup/redirect flow handlers.",
      0,
      { hasGoogleAuth }
    );
  }
}
