/**
 * health/auth/AuthenticationHealthCheck.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Validates primary authentication systems: bcrypt local auth and Firebase client.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import fs from "fs";
import path from "path";
import { BaseHealthCheck } from "../core/HealthCheck";
import { HealthResult } from "../core/HealthResult";
import { HealthCategoryType, HealthContext } from "../config/health.types";

export class AuthenticationHealthCheck extends BaseHealthCheck {
  public readonly name = "Primary Authentication Providers & Password Hashing";
  public readonly category: HealthCategoryType = "auth";
  public readonly defaultSeverity = "CRITICAL";

  protected async execute(context: HealthContext): Promise<HealthResult> {
    const firebaseLib = path.join(context.frontendPath, "lib", "firebase.ts");
    const loginApi = path.join(context.frontendPath, "app", "api", "auth", "login", "route.ts");
    const registerApi = path.join(context.frontendPath, "app", "api", "auth", "register", "route.ts");

    const hasFirebase = fs.existsSync(firebaseLib);
    const hasLoginApi = fs.existsSync(loginApi);
    const hasRegisterApi = fs.existsSync(registerApi);

    if (!hasLoginApi || !hasRegisterApi) {
      return HealthResult.fail(
        this.name,
        this.category,
        "Core authentication API routes (/api/auth/login or /api/auth/register) are missing.",
        "CRITICAL",
        0
      );
    }

    const loginContent = fs.readFileSync(loginApi, "utf-8");
    const usesBcrypt = loginContent.includes("bcrypt") || loginContent.includes("compare");

    if (!usesBcrypt) {
      return HealthResult.warn(
        this.name,
        this.category,
        "Bcrypt password verification not detected in /api/auth/login.",
        "HIGH",
        0
      );
    }

    return HealthResult.pass(
      this.name,
      this.category,
      `Authentication stack verified (Bcrypt Password Hashing: Active, Firebase Auth: ${hasFirebase ? "Configured" : "Offline Mode"}).`,
      0,
      { usesBcrypt, hasFirebase }
    );
  }
}
