/**
 * frontend/app/api/analytics/route.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * POST /api/analytics — Ingest client interaction telemetry.
 * GET /api/analytics — Query aggregate analytics (Admin/Staff only).
 * ─────────────────────────────────────────────────────────────────────────────
 */

export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { getAuthenticatedUser, requireAdminOrDev } from "@/lib/authMiddleware";
import { insertAnalyticsEvent, findAnalyticsEvents } from "@/lib/mongodb/repositories/analyticsEventRepository";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { eventName, properties, sessionId } = body;

    if (!eventName) {
      return NextResponse.json({ error: "eventName is required" }, { status: 400 });
    }

    const auth = await getAuthenticatedUser(req);
    const userId = auth?.uid || body.userId;

    const id = await insertAnalyticsEvent({
      eventName,
      userId,
      sessionId,
      properties: properties || {},
    });

    return NextResponse.json({ success: true, id });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function GET(req: Request) {
  const auth = await requireAdminOrDev(req);
  if (auth instanceof NextResponse) return auth;

  const url = new URL(req.url);
  const eventName = url.searchParams.get("eventName") || undefined;
  const userId = url.searchParams.get("userId") || undefined;
  const limit = parseInt(url.searchParams.get("limit") || "50", 10);
  const cursor = url.searchParams.get("cursor") || undefined;

  const result = await findAnalyticsEvents({
    eventName,
    userId,
    limit,
    cursor,
  });

  return NextResponse.json(result);
}
