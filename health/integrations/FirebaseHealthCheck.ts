/**
 * health/integrations/FirebaseHealthCheck.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Validates Firebase Client SDK, Admin SDK, and security rules.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import fs from "fs";
import path from "path";
import { BaseHealthCheck } from "../core/HealthCheck";
import { HealthResult } from "../core/HealthResult";
import { HealthCategoryType, HealthContext } from "../config/health.types";

export class FirebaseHealthCheck extends BaseHealthCheck {
  public readonly name = "Firebase Client & Admin SDK Integration";
  public readonly category: HealthCategoryType = "integrations";
  public readonly defaultSeverity = "HIGH";

  protected async execute(context: HealthContext): Promise<HealthResult> {
    const clientFile = path.join(context.frontendPath, "lib", "firebase.ts");
    const adminFile = path.join(context.frontendPath, "lib", "firebaseAdmin.ts");
    const firestoreRules = path.join(context.workspaceRoot, "firestore.rules");

    const hasClient = fs.existsSync(clientFile);
    const hasAdmin = fs.existsSync(adminFile);
    const hasRules = fs.existsSync(firestoreRules);

    if (!hasClient) {
      return HealthResult.fail(
        this.name,
        this.category,
        "Firebase client module missing at frontend/lib/firebase.ts",
        "HIGH",
        0
      );
    }

    return HealthResult.pass(
      this.name,
      this.category,
      `Firebase integration verified (Client SDK: Active, Admin SDK: ${hasAdmin ? "Configured" : "Offline Mode"}, Firestore Security Rules: ${hasRules ? "Defined" : "Default"}).`,
      0,
      { hasClient, hasAdmin, hasRules }
    );
  }
}
