/**
 * frontend/app/api/health/live/route.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Kubernetes & Cloud Native Liveness Probe.
 * Fast, lightweight process-level health check.
 * ─────────────────────────────────────────────────────────────────────────────
 */

export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";

export async function GET() {
  const memoryUsage = process.memoryUsage();
  
  return NextResponse.json(
    {
      status: "LIVE",
      uptimeSeconds: Math.floor(process.uptime()),
      timestamp: new Date().toISOString(),
      process: {
        nodeVersion: process.version,
        memory: {
          rssMb: Math.round(memoryUsage.rss / (1024 * 1024)),
          heapUsedMb: Math.round(memoryUsage.heapUsed / (1024 * 1024)),
          heapTotalMb: Math.round(memoryUsage.heapTotal / (1024 * 1024)),
        },
      },
    },
    { status: 200 }
  );
}

export async function HEAD() {
  return new Response(null, { status: 200 });
}
