/**
 * frontend/app/api/system-events/route.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * GET /api/system-events — Domain event & loop execution telemetry.
 * Super Admin & Admin access only.
 * ─────────────────────────────────────────────────────────────────────────────
 */

export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { requireAdminOrDev } from "@/lib/authMiddleware";
import { findSystemEvents } from "@/lib/mongodb/repositories/systemEventRepository";

export async function GET(req: Request) {
  const auth = await requireAdminOrDev(req);
  if (auth instanceof NextResponse) return auth;

  const url = new URL(req.url);
  const limit = parseInt(url.searchParams.get("limit") || "20", 10);
  const cursor = url.searchParams.get("cursor") || undefined;
  const eventType = url.searchParams.get("eventType") || undefined;
  const aggregateType = url.searchParams.get("aggregateType") || undefined;
  const aggregateId = url.searchParams.get("aggregateId") || undefined;
  const correlationId = url.searchParams.get("correlationId") || undefined;

  const result = await findSystemEvents({
    eventType,
    aggregateType,
    aggregateId,
    correlationId,
    limit,
    cursor,
  });

  return NextResponse.json(result);
}
