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
  const isDev = process.env.NODE_ENV === "development";

  try {
    // 1. Check PostgreSQL (Neon)
    let postgresqlStatus: "healthy" | "unhealthy" | "offline" = "unhealthy";
    let pgLatencyMs = 0;
    try {
      if (process.env.DB_OFFLINE === "true" || !process.env.DATABASE_URL) {
        postgresqlStatus = "offline";
      } else {
        const pgStart = Date.now();
        let timeoutTimer: NodeJS.Timeout | undefined;
        const timeoutPromise = new Promise<never>((_, reject) => {
          timeoutTimer = setTimeout(() => reject(new Error("PostgreSQL probe timed out")), 4000);
        });

        const pgCheck = (async () => {
          try {
            return await prisma.$queryRaw`SELECT 1`;
          } catch {
            return null;
          }
        })();

        try {
          const result = await Promise.race([pgCheck, timeoutPromise]);
          if (timeoutTimer) clearTimeout(timeoutTimer);
          if (result !== null) {
            pgLatencyMs = Date.now() - pgStart;
            postgresqlStatus = "healthy";
          } else {
            postgresqlStatus = "unhealthy";
          }
        } catch {
          if (timeoutTimer) clearTimeout(timeoutTimer);
          postgresqlStatus = "unhealthy";
        }
      }
    } catch {
      postgresqlStatus = "unhealthy";
    }

    // 2. Check MongoDB Atlas
    let mongodbStatus: "healthy" | "unhealthy" | "offline" = "unhealthy";
    let mongoLatencyMs = 0;
    try {
      if (process.env.MONGODB_OFFLINE === "true" || !process.env.MONGODB_URI) {
        mongodbStatus = "offline";
      } else {
        const mongoHealth = await checkMongoHealth().catch(() => ({ status: "unhealthy" as const, latencyMs: 0 }));
        mongoLatencyMs = mongoHealth.latencyMs || 0;
        if (mongoHealth.status === "healthy") {
          mongodbStatus = "healthy";
        } else if (mongoHealth.status === "offline") {
          mongodbStatus = "offline";
        } else {
          mongodbStatus = "unhealthy";
        }
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
      const cfg = cloudinary?.config ? cloudinary.config() : null;
      const cloudName = cfg?.cloud_name;
      const apiKey = cfg?.api_key;
      cloudinaryStatus = (cloudName && apiKey) ? "healthy" : "unconfigured";
    } catch {
      cloudinaryStatus = "unconfigured";
    }

    // Core requirement: PostgreSQL must be healthy for system to be operational
    // In dev, tolerate offline/unhealthy so local UI development continues seamlessly
    const isCoreHealthy = postgresqlStatus === "healthy" || (isDev && postgresqlStatus === "offline");
    const isFullyHealthy = postgresqlStatus === "healthy" && mongodbStatus === "healthy" && firebaseStatus === "healthy" && cloudinaryStatus === "healthy";

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
      status: isCoreHealthy ? 200 : (isDev ? 200 : 503),
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate",
      },
    });
  } catch (err: any) {
    console.error("[HEALTH/GET] Uncaught error gracefully intercepted:", err?.message || err);
    return NextResponse.json(
      {
        status: "degraded",
        timestamp,
        durationMs: Date.now() - startTime,
        error: "Health check probe gracefully degraded",
      },
      {
        status: isDev ? 200 : 503,
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate",
        },
      }
    );
  }
}

export async function HEAD() {
  return new Response(null, { status: 200 });
}
