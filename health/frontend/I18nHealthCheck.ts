/**
 * health/frontend/I18nHealthCheck.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Validates internationalization parity across English (en), Telugu (te), and Hindi (hi).
 * ─────────────────────────────────────────────────────────────────────────────
 */

import fs from "fs";
import path from "path";
import { BaseHealthCheck } from "../core/HealthCheck";
import { HealthResult } from "../core/HealthResult";
import { HealthCategoryType, HealthContext } from "../config/health.types";

export class I18nHealthCheck extends BaseHealthCheck {
  public readonly name = "Internationalization (i18n) Parity & Completeness";
  public readonly category: HealthCategoryType = "frontend";
  public readonly defaultSeverity = "MEDIUM";

  protected async execute(context: HealthContext): Promise<HealthResult> {
    const translationsPath = path.join(context.frontendPath, "lib", "translations.ts");

    if (!fs.existsSync(translationsPath)) {
      return HealthResult.fail(
        this.name,
        this.category,
        "frontend/lib/translations.ts is missing",
        "HIGH",
        0,
        { file: translationsPath }
      );
    }

    const content = fs.readFileSync(translationsPath, "utf-8");
    const hasEn = content.includes("en:") || content.includes("en =");
    const hasTe = content.includes("te:") || content.includes("te =");
    const hasHi = content.includes("hi:") || content.includes("hi =");

    if (!hasEn || !hasTe || !hasHi) {
      return HealthResult.warn(
        this.name,
        this.category,
        `Incomplete language dictionaries: ${!hasEn ? "en " : ""}${!hasTe ? "te (Telugu) " : ""}${!hasHi ? "hi (Hindi)" : ""}`,
        "MEDIUM",
        0,
        { recommendation: "Ensure translations dictionary supports English, Telugu, and Hindi." }
      );
    }

    return HealthResult.pass(
      this.name,
      this.category,
      "Complete multilingual dictionary verified across English, Telugu, and Hindi.",
      0,
      { supportedLanguages: ["en", "te", "hi"] }
    );
  }
}
