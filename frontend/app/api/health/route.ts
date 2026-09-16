/**
 * frontend/app/api/health/route.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Polyglot Persistence Multi-Service Health Check Endpoint.
 * Sanitized, non-leaking health status for PostgreSQL, MongoDB, Firebase, and Cloudinary.
 * ─────────────────────────────────────────────────────────────────────────────
 */

export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { checkMongoHealth } from "@/lib/mongodb/client";
import { isAdminReady } from "@/lib/firebaseAdmin";
import { cloudinary } from "@/lib/cloudinary";

export async function GET() {
  const timestamp = new Date().toISOString();
  const startTime = Date.now();

  // 1. Check PostgreSQL (Neon)
  let postgresqlStatus: "healthy" | "unhealthy" | "offline" = "unhealthy";
  let pgLatencyMs = 0;
  try {
    if (process.env.DB_OFFLINE === "true") {
      postgresqlStatus = "offline";
    } else {
      const pgStart = Date.now();
      const pgCheck = prisma.$queryRaw`SELECT 1`;
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("PostgreSQL probe timed out")), 3000)
      );
      await Promise.race([pgCheck, timeoutPromise]);
      pgLatencyMs = Date.now() - pgStart;
      postgresqlStatus = "healthy";
    }
  } catch {
    postgresqlStatus = "unhealthy";
  }

  // 2. Check MongoDB Atlas
  let mongodbStatus: "healthy" | "unhealthy" | "offline" = "unhealthy";
  let mongoLatencyMs = 0;
  try {
    const mongoHealth = await checkMongoHealth();
    mongoLatencyMs = mongoHealth.latencyMs || 0;
    if (mongoHealth.status === "healthy") {
      mongodbStatus = "healthy";
    } else if (mongoHealth.status === "offline") {
      mongodbStatus = "offline";
    } else {
      mongodbStatus = "unhealthy";
    }
  } catch {
    mongodbStatus = "unhealthy";
  }

  // 3. Check Firebase Admin SDK
  let firebaseStatus: "healthy" | "unconfigured" = "unconfigured";
  try {
    firebaseStatus = isAdminReady() ? "healthy" : "unconfigured";
  } catch {
    firebaseStatus = "unconfigured";
  }

  // 4. Check Cloudinary Configuration
  let cloudinaryStatus: "healthy" | "unconfigured" = "unconfigured";
  try {
    const cloudName = cloudinary.config().cloud_name;
    const apiKey = cloudinary.config().api_key;
    cloudinaryStatus = (cloudName && apiKey) ? "healthy" : "unconfigured";
  } catch {
    cloudinaryStatus = "unconfigured";
  }

  // Core requirement: PostgreSQL must be healthy for system to be operational
  const isCoreHealthy = postgresqlStatus === "healthy";
  const isFullyHealthy = isCoreHealthy && mongodbStatus === "healthy" && firebaseStatus === "healthy" && cloudinaryStatus === "healthy";

  let overallStatus: "healthy" | "degraded" | "unhealthy";
  if (isFullyHealthy) {
    overallStatus = "healthy";
  } else if (isCoreHealthy) {
    overallStatus = "degraded";
  } else {
    overallStatus = "unhealthy";
  }

  const responsePayload = {
    status: overallStatus,
    timestamp,
    durationMs: Date.now() - startTime,
    services: {
      postgresql: {
        status: postgresqlStatus,
        latencyMs: pgLatencyMs,
      },
      mongodb: {
        status: mongodbStatus,
        latencyMs: mongoLatencyMs,
      },
      firebase: {
        status: firebaseStatus,
      },
      cloudinary: {
        status: cloudinaryStatus,
      },
    },
  };

  return NextResponse.json(responsePayload, {
    status: isCoreHealthy ? 200 : 503,
  });
}

export async function HEAD() {
  return new Response(null, { status: 200 });
}
