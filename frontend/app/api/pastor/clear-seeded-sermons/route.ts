import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

/**
 * POST /api/pastor/clear-seeded-sermons
 * 
 * Deletes all sermons with IDs matching the seed pattern from the database.
 * 
 * Auth: Handled entirely by Next.js Edge Middleware (middleware.ts).
 * The __kcm_session_role cookie is validated before reaching this handler —
 * only EVENT_MANAGER, PASTOR, ADMIN, SUPER_ADMIN roles can reach this endpoint.
 * No Firebase JWT check needed here.
 */
export async function POST(req: Request) {
  try {
    // Delete all 6 seeded placeholder sermons
    const result = await prisma.sermon.deleteMany({
      where: {
        id: {
          in: [
            "sermon_001",
            "sermon_002",
            "sermon_003",
            "sermon_004",
            "sermon_005",
            "sermon_006",
          ],
        },
      },
    });

    console.log(`[PASTOR] Cleared ${result.count} seeded sermons from database.`);

    // Trigger Socket.io companion to auto-refresh landing page
    const companionUrl = process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3001";
    try {
      await fetch(`${companionUrl}/api/trigger-event`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "sermon:uploaded",
          payload: { action: "bulk-deleted", count: result.count },
        }),
      });
    } catch (socketErr) {
      console.warn("[PASTOR] Socket companion broadcast skipped:", socketErr);
    }

    return NextResponse.json({
      success: true,
      deletedCount: result.count,
      message: `Successfully deleted ${result.count} seeded sermons. The landing page will now only show real sermons.`,
    });
  } catch (err: any) {
    console.error("[PASTOR/CLEAR-SEEDED-SERMONS] Error:", err);
    return NextResponse.json(
      { error: err?.message || "Database error occurred" },
      { status: 500 }
    );
  }
}
