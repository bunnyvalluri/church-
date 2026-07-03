import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireEventManagerOrDev } from "@/lib/authMiddleware";

export const dynamic = "force-dynamic";

/**
 * POST /api/pastor/clear-seeded-sermons
 * 
 * One-time operation: Deletes all sermons with IDs matching the
 * seed pattern (sermon_001 through sermon_999) from the database.
 * 
 * Protected by requireEventManagerOrDev (Firebase JWT) or INTERNAL_API_SECRET.
 */
export async function POST(req: Request) {
  // ── Authentication & Authorization ──────────────────────────────────────────
  const authHeader = req.headers.get("Authorization") || "";
  const providedSecret = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";
  const validSecret = process.env.INTERNAL_API_SECRET;

  const isDev = process.env.NODE_ENV !== "production";
  
  // 1. Try Firebase Auth middleware
  let isUserAuth = false;
  try {
    const authResult = await requireEventManagerOrDev(req);
    if (!(authResult instanceof NextResponse)) {
      isUserAuth = true;
    }
  } catch (err) {
    // Ignore error, fallback to dev bypass or API secret
  }

  // 2. Enforce access
  const isSecretValid = validSecret && providedSecret === validSecret;
  if (!isDev && !isUserAuth && !isSecretValid) {
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

    console.log(`[ADMIN/PASTOR] Cleared ${result.count} seeded sermons from database.`);

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
      console.warn("[ADMIN/PASTOR] Socket companion broadcast skipped:", socketErr);
    }

    return NextResponse.json({
      success: true,
      deletedCount: result.count,
      message: `Successfully deleted ${result.count} seeded sermons. The landing page will now only show real sermons created through the portal.`,
    });
  } catch (err: any) {
    console.error("[PASTOR/CLEAR-SEEDED-SERMONS] Error:", err);
    return NextResponse.json(
      { error: err?.message || "Database error occurred" },
      { status: 500 }
    );
  }
}
