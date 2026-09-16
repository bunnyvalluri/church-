/**
 * frontend/app/api/health/ready/route.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Kubernetes & Cloud Native Readiness Probe.
 * Verifies that the service can connect to the primary database before routing traffic.
 * ─────────────────────────────────────────────────────────────────────────────
 */

export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const start = Date.now();
  try {
    if (process.env.DB_OFFLINE === "true") {
      return NextResponse.json(
        {
          status: "NOT_READY",
          database: "OFFLINE_BYPASSED",
          latencyMs: 0,
          timestamp: new Date().toISOString(),
        },
        { status: 503 }
      );
    }

    const pgCheck = prisma.$queryRaw`SELECT 1`;
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Database probe timeout")), 3000)
    );
    await Promise.race([pgCheck, timeoutPromise]);
    const latencyMs = Date.now() - start;

    return NextResponse.json(
      {
        status: "READY",
        database: "CONNECTED",
        latencyMs,
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    );
  } catch {
    return NextResponse.json(
      {
        status: "NOT_READY",
        database: "DISCONNECTED",
        latencyMs: Date.now() - start,
        timestamp: new Date().toISOString(),
      },
      { status: 503 }
    );
  }
}

export async function HEAD() {
  return new Response(null, { status: 200 });
}
