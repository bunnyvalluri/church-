/**
 * frontend/app/api/notifications/history/route.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * GET /api/notifications/history — Multi-channel notification delivery history.
 * ─────────────────────────────────────────────────────────────────────────────
 */

export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/authMiddleware";
import { findNotificationEvents, NotificationStatus, NotificationChannel } from "@/lib/mongodb/repositories/notificationEventRepository";

export async function GET(req: Request) {
  const auth = await requireAuth(req);
  if (auth instanceof NextResponse) return auth;

  const url = new URL(req.url);
  const limit = parseInt(url.searchParams.get("limit") || "20", 10);
  const cursor = url.searchParams.get("cursor") || undefined;
  const status = (url.searchParams.get("status") as NotificationStatus) || undefined;
  const channel = (url.searchParams.get("channel") as NotificationChannel) || undefined;
  const requestedRecipientId = url.searchParams.get("recipientId") || undefined;

  const isStaffOrAdmin =
    auth.role === "SUPER_ADMIN" ||
    auth.role === "ADMIN" ||
    auth.role === "PASTOR";

  // Regular members can only view their own notifications
  const recipientId = isStaffOrAdmin ? requestedRecipientId : auth.uid;

  const result = await findNotificationEvents({
    recipientId,
    status,
    channel,
    limit,
    cursor,
  });

  return NextResponse.json(result);
}
