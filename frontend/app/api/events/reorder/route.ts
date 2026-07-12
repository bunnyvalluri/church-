import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireEventManagerOrDev } from "@/lib/authMiddleware";
import { triggerSocketBroadcast, logAuditEvent } from "@/lib/eventServices";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const auth = await requireEventManagerOrDev(req);
  if (auth instanceof NextResponse) return auth;

  try {
    const body = await req.json();
    const { ids } = body; // Array of event ids in the desired order

    if (!ids || !Array.isArray(ids)) {
      return NextResponse.json(
        { error: "Invalid parameter: ids must be an array of event IDs." },
        { status: 400 }
      );
    }

    // Execute bulk updates in a transaction
    await prisma.$transaction(
      ids.map((id, index) =>
        prisma.event.update({
          where: { id },
          data: { displayOrder: index },
        })
      )
    );

    // Broadcast reorder event to update landing page
    await triggerSocketBroadcast("event.reorder", { ids });

    // Log Audit log
    await logAuditEvent(
      auth.uid,
      "EVENT_REORDER",
      `Reordered ${ids.length} events.`
    );

    return NextResponse.json({ success: true, message: "Events reordered successfully." });
  } catch (err: any) {
    console.error("[API/EVENTS/REORDER] Error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to reorder events." },
      { status: 500 }
    );
  }
}
