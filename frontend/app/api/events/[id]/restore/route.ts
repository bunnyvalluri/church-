import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireEventManagerOrDev } from "@/lib/authMiddleware";
import { triggerSocketBroadcast, logAuditEvent } from "@/lib/eventServices";

export const dynamic = "force-dynamic";

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  const auth = await requireEventManagerOrDev(req);
  if (auth instanceof NextResponse) return auth;

  try {
    const event = await prisma.event.findUnique({
      where: { id: params.id },
      include: { branch: true },
    });

    if (!event) {
      return NextResponse.json({ error: "Event not found." }, { status: 404 });
    }

    if (!event.isDeleted) {
      return NextResponse.json({ error: "Event is not deleted." }, { status: 400 });
    }

    const restored = await prisma.event.update({
      where: { id: params.id },
      data: {
        isDeleted: false,
        deletedAt: null,
      },
    });

    // Broadcast socket update
    await triggerSocketBroadcast("event.restored", {
      id: restored.id,
      title: restored.title,
      slug: restored.slug,
      branchName: event.branch?.name || "General",
    });

    // Log Audit Log
    await logAuditEvent(
      auth.uid,
      "EVENT_RESTORE",
      `Restored soft-deleted event "${restored.title}" (${restored.id}).`
    );

    return NextResponse.json({ success: true, event: restored });
  } catch (err: any) {
    console.error("[API/EVENTS/RESTORE] Error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to restore event." },
      { status: 500 }
    );
  }
}
