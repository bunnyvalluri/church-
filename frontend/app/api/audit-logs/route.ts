/**
 * frontend/app/api/audit-logs/route.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * GET /api/audit-logs — Admin-only audit log timeline from MongoDB Atlas.
 * ─────────────────────────────────────────────────────────────────────────────
 */

export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { requireAdminOrDev } from "@/lib/authMiddleware";
import { getAuditTimeline } from "@/lib/mongodb/services/auditService";

export async function GET(req: Request) {
  const auth = await requireAdminOrDev(req);
  if (auth instanceof NextResponse) return auth;

  const url = new URL(req.url);
  const limit = parseInt(url.searchParams.get("limit") || "20", 10);
  const cursor = url.searchParams.get("cursor") || undefined;
  const resource = url.searchParams.get("resource") || undefined;
  const resourceId = url.searchParams.get("resourceId") || undefined;
  const action = url.searchParams.get("action") || undefined;
  const actorId = url.searchParams.get("actorId") || undefined;

  const result = await getAuditTimeline({
    actorId,
    resource,
    resourceId,
    action,
    limit,
    cursor,
  });

  return NextResponse.json(result);
}
