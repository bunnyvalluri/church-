/**
 * frontend/app/api/activity/route.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * GET /api/activity — Paginated activity feed with RBAC enforcement.
 * ─────────────────────────────────────────────────────────────────────────────
 */

export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/authMiddleware";
import { getActivityFeed } from "@/lib/mongodb/services/activityService";

export async function GET(req: Request) {
  const auth = await requireAuth(req);
  if (auth instanceof NextResponse) return auth;

  const url = new URL(req.url);
  const limit = parseInt(url.searchParams.get("limit") || "20", 10);
  const cursor = url.searchParams.get("cursor") || undefined;
  const entityType = url.searchParams.get("entityType") || undefined;
  const requestedActorId = url.searchParams.get("actorId") || undefined;

  const isStaffOrAdmin =
    auth.role === "SUPER_ADMIN" ||
    auth.role === "ADMIN" ||
    auth.role === "PASTOR" ||
    auth.role === "EVENT_MANAGER";

  // Members can only query their own activity history
  const actorId = isStaffOrAdmin ? requestedActorId : auth.uid;

  const result = await getActivityFeed({
    actorId,
    entityType,
    limit,
    cursor,
  });

  return NextResponse.json(result);
}
