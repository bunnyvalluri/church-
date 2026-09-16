/**
 * health/frontend/PWAHealthCheck.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Inspects Progressive Web App assets (manifest, service worker, offline support).
 * ─────────────────────────────────────────────────────────────────────────────
 */

import fs from "fs";
import path from "path";
import { BaseHealthCheck } from "../core/HealthCheck";
import { HealthResult } from "../core/HealthResult";
import { HealthCategoryType, HealthContext } from "../config/health.types";

export class PWAHealthCheck extends BaseHealthCheck {
  public readonly name = "PWA & Offline Service Worker Integrity";
  public readonly category: HealthCategoryType = "frontend";
  public readonly defaultSeverity = "HIGH";

  protected async execute(context: HealthContext): Promise<HealthResult> {
    const publicDir = path.join(context.frontendPath, "public");
    const appDir = path.join(context.frontendPath, "app");

    const hasManifest =
      fs.existsSync(path.join(publicDir, "manifest.json")) ||
      fs.existsSync(path.join(publicDir, "manifest.webmanifest")) ||
      fs.existsSync(path.join(appDir, "manifest.ts"));

    const hasServiceWorker =
      fs.existsSync(path.join(publicDir, "sw.js")) ||
      fs.existsSync(path.join(publicDir, "service-worker.js"));

    const hasOfflinePage =
      fs.existsSync(path.join(appDir, "offline", "page.tsx")) ||
      fs.existsSync(path.join(publicDir, "offline.html"));

    if (!hasManifest) {
      return HealthResult.warn(
        this.name,
        this.category,
        "Web App Manifest (manifest.json or app/manifest.ts) not found.",
        "MEDIUM",
        0,
        { recommendation: "Add manifest.json in public/ to enable installable PWA behavior." }
      );
    }

    if (!hasServiceWorker) {
      return HealthResult.warn(
        this.name,
        this.category,
        "Service worker file (sw.js) not found in public directory.",
        "LOW",
        0,
        { recommendation: "Implement service worker for background cache and offline functionality." }
      );
    }

    return HealthResult.pass(
      this.name,
      this.category,
      `PWA assets verified (Manifest: ${hasManifest ? "Yes" : "No"}, ServiceWorker: ${hasServiceWorker ? "Yes" : "No"}, Offline: ${hasOfflinePage ? "Yes" : "No"}).`,
      0,
      { hasManifest, hasServiceWorker, hasOfflinePage }
    );
  }
}
