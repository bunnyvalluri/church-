/**
 * frontend/app/api/health/dependencies/route.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Comprehensive Dependency Health & Latency Endpoint.
 * Reports health of PostgreSQL, MongoDB, Firebase Admin, Cloudinary,
 * and External communication gateways without leaking secrets.
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
  const startAll = Date.now();

  // 1. PostgreSQL Probe
  let pgResult: { status: string; latencyMs: number } = { status: "unhealthy", latencyMs: 0 };
  const pgStart = Date.now();
  try {
    if (process.env.DB_OFFLINE === "true") {
      pgResult = { status: "offline", latencyMs: 0 };
    } else {
      const pgCheck = prisma.$queryRaw`SELECT 1`;
      const timeout = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Timeout")), 3000)
      );
      await Promise.race([pgCheck, timeout]);
      pgResult = { status: "healthy", latencyMs: Date.now() - pgStart };
    }
  } catch {
    pgResult = { status: "unhealthy", latencyMs: Date.now() - pgStart };
  }

  // 2. MongoDB Atlas Probe
  let mongoResult: { status: string; latencyMs: number } = { status: "unhealthy", latencyMs: 0 };
  try {
    const res = await checkMongoHealth();
    mongoResult = { status: res.status, latencyMs: res.latencyMs || 0 };
  } catch {
    mongoResult = { status: "unhealthy", latencyMs: 0 };
  }

  // 3. Firebase Admin Probe
  const firebaseReady = isAdminReady();
  const firebaseResult = {
    status: firebaseReady ? "healthy" : "unconfigured",
    authProvider: "firebase",
  };

  // 4. Cloudinary Probe
  const cloudConfig = cloudinary.config();
  const cloudinaryResult = {
    status: cloudConfig.cloud_name && cloudConfig.api_key ? "healthy" : "unconfigured",
    configured: !!(cloudConfig.cloud_name && cloudConfig.api_key),
  };

  // 5. Realtime Socket Config check
  const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL;
  const realtimeResult = {
    status: socketUrl ? "configured" : "unconfigured",
    isSecure: socketUrl ? socketUrl.startsWith("https") || socketUrl.startsWith("wss") : false,
  };

  // 6. Payment Gateways Config check
  const razorpayConfigured = !!(process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET);
  const stripeConfigured = !!(process.env.STRIPE_SECRET_KEY || process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);
  const paymentsResult = {
    status: razorpayConfigured || stripeConfigured ? "healthy" : "unconfigured",
    gateways: {
      razorpay: razorpayConfigured ? "configured" : "unconfigured",
      stripe: stripeConfigured ? "configured" : "unconfigured",
    },
  };

  // 7. Email & SMS Delivery Config check
  const emailConfigured = !!(process.env.RESEND_API_KEY || process.env.SMTP_HOST);
  const smsConfigured = !!(process.env.HTTPSMS_API_KEY || process.env.TWILIO_AUTH_TOKEN);
  const communicationsResult = {
    email: emailConfigured ? "configured" : "unconfigured",
    sms: smsConfigured ? "configured" : "unconfigured",
  };

  const isCoreOperational = pgResult.status === "healthy";

  return NextResponse.json(
    {
      status: isCoreOperational ? "operational" : "degraded",
      timestamp,
      totalDurationMs: Date.now() - startAll,
      dependencies: {
        database_postgresql: pgResult,
        database_mongodb: mongoResult,
        auth_firebase: firebaseResult,
        media_cloudinary: cloudinaryResult,
        realtime_socket: realtimeResult,
        payments: paymentsResult,
        communications: communicationsResult,
      },
    },
    { status: isCoreOperational ? 200 : 503 }
  );
}

export async function HEAD() {
  return new Response(null, { status: 200 });
}
