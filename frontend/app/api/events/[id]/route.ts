import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireEventManagerOrDev, requireAdminOrDev, getAuthenticatedUser } from "@/lib/authMiddleware";
import { z } from "zod";

export const dynamic = "force-dynamic";

const UpdateEventSchema = z.object({
  title: z.string().min(2).max(255).optional(),
  description: z.string().min(10).max(5000).optional(),
  date: z.string().optional(),
  time: z.string().optional(),
  location: z.string().min(2).max(500).optional(),
  category: z.enum(["WORSHIP", "PRAYER", "YOUTH", "CHILDREN", "WOMEN", "MEN", "SPECIAL"]).optional(),
  branchId: z.string().nullable().optional(),
  status: z.enum(["DRAFT", "PUBLISHED", "CANCELLED", "COMPLETED"]).optional(),
  image: z.string().url().nullable().optional().or(z.literal("")),
});

// ── GET /api/events/[id] ────────────────────────────────────────────────────────
// Public — get single event with all media
export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const event = await prisma.event.findUnique({
      where: { id: params.id },
      include: {
        branch: true,
        createdBy: { select: { id: true, name: true, image: true } },
        media: { orderBy: { uploadedAt: "asc" } },
        registrations: { select: { id: true } },
        _count: { select: { registrations: true, media: true } },
      },
    });

    if (!event) {
      return NextResponse.json({ error: "Event not found." }, { status: 404 });
    }

    return NextResponse.json({ success: true, event });
  } catch (err: any) {
    console.error("[API/EVENTS/[id]/GET] Error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to load event." },
      { status: 500 }
    );
  }
}

// ── PATCH /api/events/[id] ──────────────────────────────────────────────────────
// Update event — event manager or admin
export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  const auth = await requireEventManagerOrDev(req);
  if (auth instanceof NextResponse) return auth;

  try {
    const body = await req.json();
    const parsed = UpdateEventSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 422 }
      );
    }

    const data: any = { ...parsed.data };
    if (data.date) data.date = new Date(data.date);
    if (data.image === "") data.image = null;

    const event = await prisma.event.update({
      where: { id: params.id },
      data,
      include: {
        branch: true,
        createdBy: { select: { name: true } },
        media: true,
        _count: { select: { registrations: true, media: true } },
      },
    });

    // Notify landing page of status change via Socket.io
    if (parsed.data.status === "PUBLISHED") {
      try {
        await fetch("http://localhost:3001/api/trigger-event", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: "new-event",
            payload: {
              id: event.id,
              title: event.title,
              description: event.description,
              date: event.date,
              location: event.location,
              category: event.category,
              status: event.status,
              branchName: event.branch?.name || null,
              image: event.image,
            },
          }),
        });
      } catch { /* Socket offline — skip */ }
    }

    return NextResponse.json({ success: true, event });
  } catch (err: any) {
    console.error("[API/EVENTS/[id]/PATCH] Error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to update event." },
      { status: 500 }
    );
  }
}

// ── DELETE /api/events/[id] ─────────────────────────────────────────────────────
// Admin only — deletes event and cascades media
export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  const auth = await requireAdminOrDev(req);
  if (auth instanceof NextResponse) return auth;

  try {
    const event = await prisma.event.findUnique({
      where: { id: params.id },
      include: { media: true },
    });

    if (!event) {
      return NextResponse.json({ error: "Event not found." }, { status: 404 });
    }

    // Delete from DB (cascade removes EventMedia rows too)
    await prisma.event.delete({ where: { id: params.id } });

    // Create audit log notification
    await prisma.notification.create({
      data: {
        type: "EVENT_DELETED",
        title: `Event Deleted: ${event.title}`,
        content: `Event "${event.title}" was deleted by ${auth.name || auth.email}.`,
        isRead: false,
      },
    });

    return NextResponse.json({ success: true, message: "Event deleted successfully." });
  } catch (err: any) {
    console.error("[API/EVENTS/[id]/DELETE] Error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to delete event." },
      { status: 500 }
    );
  }
}
