import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireEventManagerOrDev } from "@/lib/authMiddleware";
import { z } from "zod";
import { notifyEventActivity, triggerSocketBroadcast, logAuditEvent } from "@/lib/eventServices";

export const dynamic = "force-dynamic";

// Zod validation schema for updating event
const UpdateEventSchema = z.object({
  title: z.string().min(2).max(255).optional(),
  slug: z.string().optional(),
  shortDescription: z.string().optional().nullable(),
  description: z.string().min(10).max(5000).optional(),
  date: z.string().optional(), // start date
  endDate: z.string().optional().nullable(),
  time: z.string().optional(), // start time
  endTime: z.string().optional().nullable(),
  timezone: z.string().optional(),
  location: z.string().min(2).max(500).optional(), // Venue
  googleMapsUrl: z.string().optional().nullable(),
  category: z.string().optional(),
  organizer: z.string().optional().nullable(),
  speaker: z.string().optional().nullable(),
  pastor: z.string().optional().nullable(),
  contactPerson: z.string().optional().nullable(),
  contactPhone: z.string().optional().nullable(),
  contactEmail: z.string().optional().nullable(),
  registrationRequired: z.boolean().optional(),
  registrationLimit: z.number().optional().nullable(),
  image: z.string().optional().nullable(),
  coverImagePublicId: z.string().optional().nullable(),
  eventBanner: z.string().optional().nullable(),
  eventBannerPublicId: z.string().optional().nullable(),
  tags: z.array(z.string()).optional(),
  featured: z.boolean().optional(),
  priority: z.enum(["LOW", "NORMAL", "HIGH", "URGENT"]).optional(),
  colorTheme: z.string().optional().nullable(),
  status: z.enum(["DRAFT", "PUBLISHED", "CANCELLED", "COMPLETED", "ARCHIVED"]).optional(),
  visibility: z.enum(["PUBLIC", "MEMBERS_ONLY", "PRIVATE"]).optional(),
  registrationOpenDate: z.string().optional().nullable(),
  registrationCloseDate: z.string().optional().nullable(),
  seoTitle: z.string().optional().nullable(),
  seoDescription: z.string().optional().nullable(),
  branchId: z.string().optional().nullable(),
});

// ── GET /api/events/[idOrSlug] ──────────────────────────────────────────────────
// Public — fetches event details. Intelligently checks by ID first, then by Slug.
export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Try finding by ID
    let event = await prisma.event.findFirst({
      where: { id, isDeleted: false },
      include: {
        branch: true,
        createdBy: { select: { id: true, name: true, image: true } },
        eventImages: true,
        eventVideos: true,
        registrations: { select: { id: true, name: true, email: true, status: true, createdAt: true } },
        _count: { select: { registrations: true } },
      },
    });

    // If not found by ID, search by slug
    if (!event) {
      event = await prisma.event.findFirst({
        where: { slug: id, isDeleted: false },
        include: {
          branch: true,
          createdBy: { select: { id: true, name: true, image: true } },
          eventImages: true,
          eventVideos: true,
          registrations: { select: { id: true, name: true, email: true, status: true, createdAt: true } },
          _count: { select: { registrations: true } },
        },
      });
    }

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

// ── PUT /api/events/[id] ────────────────────────────────────────────────────────
// Updates event details — requires Event Manager or Admin
export async function PUT(
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

    const eventToUpdate = await prisma.event.findUnique({
      where: { id: params.id },
    });

    if (!eventToUpdate) {
      return NextResponse.json({ error: "Event not found." }, { status: 404 });
    }

    const data: any = { ...parsed.data };
    if (data.date) data.date = new Date(data.date);
    if (data.endDate) data.endDate = new Date(data.endDate);
    if (data.registrationOpenDate) data.registrationOpenDate = new Date(data.registrationOpenDate);
    if (data.registrationCloseDate) data.registrationCloseDate = new Date(data.registrationCloseDate);
    if (data.status) {
      data.isPublished = data.status === "PUBLISHED";
    }

    const updatedEvent = await prisma.event.update({
      where: { id: params.id },
      data,
      include: {
        branch: true,
        createdBy: { select: { name: true } },
      },
    });

    // Notify updates
    if (updatedEvent.status === "PUBLISHED") {
      await notifyEventActivity(
        updatedEvent.id,
        "EVENT_UPDATED",
        `Event Updated: ${updatedEvent.title}`,
        `The event "${updatedEvent.title}" has been updated. Please review the new details and schedule.`,
        `/events/${updatedEvent.slug}`,
        {
          title: updatedEvent.title,
          location: updatedEvent.location,
          date: updatedEvent.date,
          coverImage: updatedEvent.image || undefined,
        }
      );
    }

    // Broadcast Socket.IO update
    await triggerSocketBroadcast("event.updated", {
      id: updatedEvent.id,
      title: updatedEvent.title,
      slug: updatedEvent.slug,
      shortDescription: updatedEvent.shortDescription,
      date: updatedEvent.date,
      time: updatedEvent.time,
      location: updatedEvent.location,
      category: updatedEvent.category,
      branchName: updatedEvent.branch?.name || "General",
      image: updatedEvent.image,
      status: updatedEvent.status,
    });

    // Log Audit
    await logAuditEvent(
      auth.uid,
      "EVENT_UPDATE",
      `Updated event details for "${updatedEvent.title}" (${updatedEvent.id}).`
    );

    return NextResponse.json({ success: true, event: updatedEvent });
  } catch (err: any) {
    console.error("[API/EVENTS/[id]/PUT] Error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to update event." },
      { status: 500 }
    );
  }
}

// ── PATCH /api/events/[id] ──────────────────────────────────────────────────────
// Alias for PUT to maintain backward compatibility in existing components
export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  return PUT(req, { params });
}

// ── DELETE /api/events/[id] ─────────────────────────────────────────────────────
// Soft deletes the event (sets isDeleted to true)
export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  const auth = await requireEventManagerOrDev(req);
  if (auth instanceof NextResponse) return auth;

  try {
    const event = await prisma.event.findUnique({
      where: { id: params.id },
    });

    if (!event) {
      return NextResponse.json({ error: "Event not found." }, { status: 404 });
    }

    // Perform Soft Delete
    const deletedEvent = await prisma.event.update({
      where: { id: params.id },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
        status: "DRAFT", // Reset published status on delete
        isPublished: false,
      },
    });

    // Notify attendees if published event is deleted/cancelled
    if (event.isPublished) {
      await notifyEventActivity(
        event.id,
        "EVENT_CANCELLED",
        `Event Cancelled: ${event.title}`,
        `We regret to inform you that the event "${event.title}" has been cancelled.`,
        `/events`,
        {
          title: event.title,
          location: event.location,
          date: event.date,
        }
      );
    }

    // Broadcast Socket.IO event.deleted
    await triggerSocketBroadcast("event.deleted", { id: params.id });

    // Log Audit Log
    await logAuditEvent(
      auth.uid,
      "EVENT_DELETE",
      `Soft deleted event "${event.title}" (${event.id}).`
    );

    return NextResponse.json({ success: true, message: "Event deleted successfully." });
  } catch (err: any) {
    console.error("[API/EVENTS/[id]/DELETE] Error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to delete event." },
      { status: 500 }
    );
  }
}
