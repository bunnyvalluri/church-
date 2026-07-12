import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireEventManagerOrDev } from "@/lib/authMiddleware";
import { notifyEventActivity, triggerSocketBroadcast, logAuditEvent } from "@/lib/eventServices";

export const dynamic = "force-dynamic";

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  const auth = await requireEventManagerOrDev(req);
  if (auth instanceof NextResponse) return auth;

  try {
    const body = await req.json();
    const { status } = body;

    const allowed = ["DRAFT", "PUBLISHED", "CANCELLED", "COMPLETED", "ARCHIVED"];
    if (!status || !allowed.includes(status)) {
      return NextResponse.json(
        { error: `Invalid status parameter. Must be one of: ${allowed.join(", ")}` },
        { status: 400 }
      );
    }

    const event = await prisma.event.findUnique({
      where: { id: params.id },
      include: { branch: true },
    });

    if (!event) {
      return NextResponse.json({ error: "Event not found." }, { status: 404 });
    }

    const updated = await prisma.event.update({
      where: { id: params.id },
      data: {
        status,
        isPublished: status === "PUBLISHED",
      },
    });

    // Real-time broadcasts based on status transition
    const socketPayload = {
      id: updated.id,
      title: updated.title,
      slug: updated.slug,
      status: updated.status,
      branchName: event.branch?.name || "General",
    };

    if (status === "PUBLISHED") {
      await triggerSocketBroadcast("event.published", socketPayload);
      await notifyEventActivity(
        updated.id,
        "NEW_EVENT",
        `Event Published: ${updated.title}`,
        `The event "${updated.title}" has been published and is now open for registrations.`,
        `/events/${updated.slug}`,
        { title: updated.title, location: updated.location, date: updated.date }
      );
    } else if (status === "CANCELLED") {
      await triggerSocketBroadcast("event.cancelled", socketPayload);
      await notifyEventActivity(
        updated.id,
        "EVENT_CANCELLED",
        `Event Cancelled: ${updated.title}`,
        `We regret to inform you that the event "${updated.title}" has been cancelled.`,
        `/events`,
        { title: updated.title, location: updated.location, date: updated.date }
      );
    } else if (status === "COMPLETED") {
      await triggerSocketBroadcast("event.completed", socketPayload);
    } else if (status === "ARCHIVED") {
      await triggerSocketBroadcast("event.archived", socketPayload);
    }

    // Log Audit
    await logAuditEvent(
      auth.uid,
      "EVENT_STATUS_CHANGE",
      `Changed status of event "${event.title}" (${event.id}) to ${status}.`
    );

    return NextResponse.json({ success: true, event: updated });
  } catch (err: any) {
    console.error("[API/EVENTS/STATUS] Error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to update event status." },
      { status: 500 }
    );
  }
}
