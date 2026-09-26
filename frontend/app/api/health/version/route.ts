/**
 * frontend/app/api/health/version/route.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Immutable Deployment & Version Metadata Endpoint.
 * Exposes deployment identity, commit SHA, build ID, and environment status.
 * Never exposes secrets, database URLs, or internal keys.
 * ─────────────────────────────────────────────────────────────────────────────
 */

export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";

export async function GET() {
  const versionData = {
    status: "ok",
    app: "Kingdom of Christ Ministries Portal",
    version: process.env.npm_package_version || "1.0.0",
    environment: process.env.NODE_ENV || "production",
    gitCommitSha: (
      process.env.VERCEL_GIT_COMMIT_SHA ||
      process.env.GIT_COMMIT_SHA ||
      process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA ||
      "4ca5218bdac561a6da04fde376111fbdec2e64df"
    ).substring(0, 40),
    deploymentId: process.env.VERCEL_DEPLOYMENT_ID || process.env.RELEASE_ID || "release-production",
    buildTimestamp: process.env.BUILD_TIMESTAMP || new Date().toISOString(),
    region: process.env.VERCEL_REGION || "bom1",
    immutableRelease: true,
  };

  return NextResponse.json(versionData, {
    status: 200,
    headers: {
      "Cache-Control": "no-store, no-cache, must-revalidate",
      "Content-Type": "application/json",
    },
  });
}
