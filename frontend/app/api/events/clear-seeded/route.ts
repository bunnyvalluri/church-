import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireEventManagerOrDev } from "@/lib/authMiddleware";

export const dynamic = "force-dynamic";

/**
 * POST /api/events/clear-seeded
 * 
 * Deletes all seeded placeholder events (services) from the database.
 * Handled safely with authorization check.
 */
export async function POST(req: Request) {
  const auth = await requireEventManagerOrDev(req);
  if (auth instanceof NextResponse) return auth;

  try {
    const seededEventIds = [
      "event_001",
      "event_002",
      "event_003",
      "event_004",
      "event_005",
      "event_006",
      "event_007",
      "event_008",
    ];

    const result = await prisma.event.deleteMany({
      where: {
        id: {
          in: seededEventIds,
        },
      },
    });

    console.log(`[EVENTS] Cleared ${result.count} seeded events/services from database.`);

    // Trigger Socket.io companion to auto-refresh landing page
    const companionUrl = process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3001";
    try {
      await fetch(`${companionUrl}/api/trigger-event`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "events:updated", // Auto-refreshes landing/event page lists
          payload: { action: "bulk-deleted", count: result.count },
        }),
      });
    } catch (socketErr) {
      console.warn("[EVENTS] Socket companion broadcast skipped:", socketErr);
    }

    return NextResponse.json({
      success: true,
      deletedCount: result.count,
      message: `Successfully deleted ${result.count} seeded events/services.`,
    });
  } catch (err: any) {
    console.error("[EVENTS/CLEAR-SEEDED] Error:", err);
    return NextResponse.json(
      { error: err?.message || "Database error occurred" },
      { status: 500 }
    );
  }
}
