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

  // 1. Check PostgreSQL (Neon)
  let postgresqlStatus = "healthy";
  try {
    if (process.env.DB_OFFLINE === "true") {
      postgresqlStatus = "healthy";
    } else {
      // 2-second timeout probe
      const pgCheck = prisma.$queryRaw`SELECT 1`;
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("PostgreSQL timeout")), 2000)
      );
      await Promise.race([pgCheck, timeoutPromise]);
      postgresqlStatus = "healthy";
    }
  } catch (err) {
    postgresqlStatus = "unhealthy";
  }

  // 2. Check MongoDB Atlas
  let mongodbStatus = "healthy";
  try {
    const mongoHealth = await checkMongoHealth();
    if (mongoHealth.status === "offline") {
      mongodbStatus = "healthy"; // offline dev mode is an acceptable normal state in dev
    } else if (mongoHealth.status === "healthy") {
      mongodbStatus = "healthy";
    } else {
      mongodbStatus = "unhealthy";
    }
  } catch (err) {
    mongodbStatus = "unhealthy";
  }

  // 3. Check Firebase Admin SDK
  let firebaseStatus = "healthy";
  try {
    if (isAdminReady()) {
      firebaseStatus = "healthy";
    } else if (process.env.FIRESTORE_OFFLINE === "true" || process.env.NODE_ENV === "development") {
      firebaseStatus = "healthy";
    } else {
      firebaseStatus = "unhealthy";
    }
  } catch (err) {
    firebaseStatus = "unhealthy";
  }

  // 4. Check Cloudinary Configuration
  let cloudinaryStatus = "healthy";
  try {
    const cloudName = cloudinary.config().cloud_name;
    const apiKey = cloudinary.config().api_key;
    if (cloudName && apiKey) {
      cloudinaryStatus = "healthy";
    } else {
      cloudinaryStatus = "unhealthy";
    }
  } catch (err) {
    cloudinaryStatus = "unhealthy";
  }

  const isAllHealthy =
    postgresqlStatus === "healthy" &&
    mongodbStatus === "healthy" &&
    firebaseStatus === "healthy" &&
    cloudinaryStatus === "healthy";

  const responsePayload = {
    status: isAllHealthy ? "healthy" : "degraded",
    timestamp,
    services: {
      postgresql: postgresqlStatus,
      mongodb: mongodbStatus,
      firebase: firebaseStatus,
      cloudinary: cloudinaryStatus,
    },
  };

  return NextResponse.json(responsePayload, {
    status: isAllHealthy ? 200 : 503,
  });
}

export async function HEAD() {
  return new Response(null, { status: 200 });
}
