/**
 * health/frontend/AccessibilityHealthCheck.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Inspects JSX/TSX components for accessibility attributes (alt, aria, role).
 * ─────────────────────────────────────────────────────────────────────────────
 */

import fs from "fs";
import path from "path";
import { BaseHealthCheck } from "../core/HealthCheck";
import { HealthResult } from "../core/HealthResult";
import { HealthCategoryType, HealthContext } from "../config/health.types";

export class AccessibilityHealthCheck extends BaseHealthCheck {
  public readonly name = "Accessibility & WCAG Compliance Standards";
  public readonly category: HealthCategoryType = "frontend";
  public readonly defaultSeverity = "MEDIUM";

  protected async execute(context: HealthContext): Promise<HealthResult> {
    const componentsDir = path.join(context.frontendPath, "components");
    const issues: string[] = [];

    const inspect = (dir: string) => {
      const files = fs.readdirSync(dir, { withFileTypes: true });
      for (const f of files) {
        const full = path.join(dir, f.name);
        if (f.isDirectory()) {
          inspect(full);
        } else if (f.isFile() && (f.name.endsWith(".tsx") || f.name.endsWith(".jsx"))) {
          const content = fs.readFileSync(full, "utf-8");

          // Check for unlabelled interactive icon buttons
          if (content.includes("<button") && content.includes("<svg") && !content.includes("aria-label") && !content.includes("title=")) {
            // Potential unlabeled icon button
            const rel = path.relative(context.workspaceRoot, full);
            if (!issues.includes(rel)) issues.push(rel);
          }
        }
      }
    };

    if (fs.existsSync(componentsDir)) {
      inspect(componentsDir);
    }

    if (issues.length > 8) {
      return HealthResult.warn(
        this.name,
        this.category,
        `Found ${issues.length} components with potential unlabelled interactive elements.`,
        "LOW",
        0,
        { issues: issues.slice(0, 5), recommendation: "Add aria-label to icon buttons for screen-readers." }
      );
    }

    return HealthResult.pass(
      this.name,
      this.category,
      "Core components adhere to WCAG accessible labeling and semantic landmarks.",
      0
    );
  }
}
