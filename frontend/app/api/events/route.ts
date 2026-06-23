import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireEventManagerOrDev } from "@/lib/authMiddleware";
import { z } from "zod";

export const dynamic = "force-dynamic";

// ── Zod validation schema ──────────────────────────────────────────────────────
const CreateEventSchema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters").max(255),
  description: z.string().min(10, "Description required").max(5000),
  date: z.string().refine((v) => !isNaN(Date.parse(v)), "Invalid date"),
  time: z.string().default("00:00"),
  location: z.string().min(2).max(500),
  category: z.enum(["WORSHIP", "PRAYER", "YOUTH", "CHILDREN", "WOMEN", "MEN", "SPECIAL"]),
  branchId: z.string().optional(),
  status: z.enum(["DRAFT", "PUBLISHED"]).default("PUBLISHED"),
  image: z.string().url().optional().or(z.literal("")),
});

// ── GET /api/events ─────────────────────────────────────────────────────────────
// Public endpoint — fetches all published events for landing page
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const branchId = searchParams.get("branchId") || undefined;
    const category = searchParams.get("category") || undefined;
    const status = searchParams.get("status") || "PUBLISHED";
    const limit = Math.min(parseInt(searchParams.get("limit") || "50"), 100);

    const where: any = {};
    if (status !== "ALL") where.status = status;
    if (branchId) where.branchId = branchId;
    if (category) where.category = category;

    const events = await prisma.event.findMany({
      where,
      orderBy: { date: "desc" },
      take: limit,
      include: {
        branch: { select: { id: true, name: true } },
        createdBy: { select: { id: true, name: true } },
        media: {
          orderBy: { uploadedAt: "asc" },
          take: 5,
        },
        _count: { select: { registrations: true, media: true } },
      },
    });

    return NextResponse.json({ success: true, events });
  } catch (err: any) {
    console.error("[API/EVENTS/GET] Error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to load events." },
      { status: 500 }
    );
  }
}

// ── POST /api/events ────────────────────────────────────────────────────────────
// Create event — requires EVENT_MANAGER, ADMIN, or SUPER_ADMIN
export async function POST(req: Request) {
  const auth = await requireEventManagerOrDev(req);
  if (auth instanceof NextResponse) return auth;

  try {
    const body = await req.json();
    const parsed = CreateEventSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 422 }
      );
    }

    const { title, description, date, time, location, category, branchId, status, image } =
      parsed.data;

    // Ensure creator user exists in DB (especially for local dev bypass users)
    const existingUser = await prisma.user.findUnique({
      where: { id: auth.uid }
    });
    if (!existingUser) {
      await prisma.user.create({
        data: {
          id: auth.uid,
          name: auth.name || "Dev User",
          email: auth.email || "dev@kcm.local",
          password: "dev_bypass_password_hash",
          role: auth.role || "EVENT_MANAGER"
        }
      });
    }

    const event = await prisma.event.create({
      data: {
        title,
        description,
        date: new Date(date),
        time,
        location,
        category: category as any,
        status: status as any,
        image: image || null,
        branchId: branchId || null,
        createdById: auth.uid,
      },
      include: {
        branch: true,
        createdBy: { select: { name: true } },
        media: true,
        _count: { select: { registrations: true, media: true } },
      },
    });

    // ── Create notification ──────────────────────────────────────────────────
    await prisma.notification.create({
      data: {
        type: "NEW_EVENT",
        title: `New Event: ${event.title}`,
        content: `A new event "${event.title}" has been created for ${event.location} on ${new Date(event.date).toLocaleDateString("en-IN")}.`,
        link: `/events/${event.id}`,
      },
    });

    // ── Emit Socket.io new-event to all connected clients ───────────────────
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
            createdBy: event.createdBy?.name || auth.name,
            mediaCount: event._count.media,
            image: event.image,
          },
        }),
      });
    } catch {
      // Socket server offline — silently skip
    }

    return NextResponse.json({ success: true, event }, { status: 201 });
  } catch (err: any) {
    console.error("[API/EVENTS/POST] Error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to create event." },
      { status: 500 }
    );
  }
}
