import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

/**
 * POST /api/admin/clear-seeded-sermons
 * 
 * One-time operation: Deletes all sermons with IDs matching the
 * seed pattern (sermon_001 through sermon_999) from the database.
 * 
 * Protected by INTERNAL_API_SECRET environment variable.
 * Call with: Authorization: Bearer <INTERNAL_API_SECRET>
 */
export async function POST(req: Request) {
  // ── Security: Require internal API secret ──────────────────────────────────
  const authHeader = req.headers.get("Authorization") || "";
  const providedSecret = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";
  const validSecret = process.env.INTERNAL_API_SECRET;

  // In development with no secret set, allow the call for convenience
  const isDev = process.env.NODE_ENV !== "production";
  if (!isDev && (!validSecret || providedSecret !== validSecret)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Delete sermons whose IDs match the seeded pattern (sermon_001, sermon_002, etc.)
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

    console.log(`[ADMIN] Cleared ${result.count} seeded sermons from database.`);

    // Trigger Socket.io companion update to auto-refresh landing page
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
      console.warn("[ADMIN] Socket companion broadcast skipped:", socketErr);
    }

    return NextResponse.json({
      success: true,
      deletedCount: result.count,
      message: `Successfully deleted ${result.count} seeded sermons. The landing page will now only show real sermons created through the portal.`,
    });
  } catch (err: any) {
    console.error("[ADMIN/CLEAR-SEEDED-SERMONS] Error:", err);
    return NextResponse.json(
      { error: err?.message || "Database error occurred" },
      { status: 500 }
    );
  }
}
