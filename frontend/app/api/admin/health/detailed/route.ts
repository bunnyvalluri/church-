/**
 * frontend/app/api/admin/health/detailed/route.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Detailed Administrative Infrastructure Health & Latency Telemetry.
 * Protected by requireAdminOrDev middleware.
 * ─────────────────────────────────────────────────────────────────────────────
 */

export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { requireAdminOrDev } from "@/lib/authMiddleware";
import { prisma } from "@/lib/prisma";
import { checkMongoHealth } from "@/lib/mongodb/client";
import { getMongoDBConfig } from "@/lib/mongodb/config";
import { isAdminReady } from "@/lib/firebaseAdmin";
import { cloudinary } from "@/lib/cloudinary";

export async function GET(req: Request) {
  const auth = await requireAdminOrDev(req);
  if (auth instanceof NextResponse) return auth;

  const timestamp = new Date().toISOString();

  // 1. PostgreSQL detailed probe
  let pgResult: { status: string; latencyMs?: number; message?: string } = { status: "unknown" };
  const pgStart = Date.now();
  try {
    if (process.env.DB_OFFLINE === "true") {
      pgResult = { status: "offline-mock", latencyMs: 0, message: "DB_OFFLINE=true" };
    } else {
      await prisma.$queryRaw`SELECT 1`;
      pgResult = { status: "healthy", latencyMs: Date.now() - pgStart };
    }
  } catch (err: any) {
    pgResult = { status: "unhealthy", latencyMs: Date.now() - pgStart, message: err.message };
  }

  // 2. MongoDB detailed probe
  const mongoConfig = getMongoDBConfig();
  const mongoResult = await checkMongoHealth();

  // 3. Firebase Admin detailed probe
  const firebaseReady = isAdminReady();
  const firebaseResult = {
    status: firebaseReady ? "healthy" : "stub-fallback",
    mode: firebaseReady ? "service-account" : "offline-or-stub",
  };

  // 4. Cloudinary detailed probe
  const cloudConfig = cloudinary.config();
  const cloudinaryResult = {
    status: cloudConfig.cloud_name && cloudConfig.api_key ? "healthy" : "unconfigured",
    cloudNameConfigured: !!cloudConfig.cloud_name,
    secure: cloudConfig.secure,
  };

  return NextResponse.json({
    status: "ok",
    timestamp,
    diagnostics: {
      postgresql: pgResult,
      mongodb: {
        ...mongoResult,
        poolConfig: {
          minPoolSize: mongoConfig.minPoolSize,
          maxPoolSize: mongoConfig.maxPoolSize,
        },
      },
      firebase: firebaseResult,
      cloudinary: cloudinaryResult,
    },
  });
}
