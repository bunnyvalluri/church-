import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireEventManagerOrDev } from "@/lib/authMiddleware";
import { z } from "zod";
import { notifyEventActivity, triggerSocketBroadcast, logAuditEvent } from "@/lib/eventServices";

export const dynamic = "force-dynamic";

// Helper function to create URL-safe slug
function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-") // Replace spaces with -
    .replace(/[^\w\-]+/g, "") // Remove all non-word chars
    .replace(/\-\-+/g, "-") // Replace multiple - with single -
    .replace(/^-+/, "") // Trim - from start
    .replace(/-+$/, ""); // Trim - from end
}

// ── Zod validation schema for Creating Event ──────────────────────────────────
const CreateEventSchema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters").max(255),
  slug: z.string().optional(),
  shortDescription: z.string().optional().nullable(),
  description: z.string().min(10, "Full description required").max(5000),
  date: z.string().refine((v) => !isNaN(Date.parse(v)), "Invalid start date"), // start date
  endDate: z.string().optional().nullable().refine((v) => !v || !isNaN(Date.parse(v)), "Invalid end date"),
  time: z.string().default("09:00"), // start time
  endTime: z.string().optional().nullable(),
  timezone: z.string().default("Asia/Kolkata"),
  location: z.string().min(2, "Venue is required").max(500),
  googleMapsUrl: z.string().optional().nullable(),
  category: z.string().min(1, "Category is required"),
  organizer: z.string().optional().nullable(),
  speaker: z.string().optional().nullable(),
  pastor: z.string().optional().nullable(),
  contactPerson: z.string().optional().nullable(),
  contactPhone: z.string().optional().nullable(),
  contactEmail: z.string().optional().nullable(),
  registrationRequired: z.boolean().default(false),
  registrationLimit: z.number().optional().nullable(),
  image: z.string().optional().nullable(), // cover image URL
  coverImagePublicId: z.string().optional().nullable(),
  eventBanner: z.string().optional().nullable(),
  eventBannerPublicId: z.string().optional().nullable(),
  tags: z.array(z.string()).default([]),
  featured: z.boolean().default(false),
  priority: z.enum(["LOW", "NORMAL", "HIGH", "URGENT"]).default("NORMAL"),
  colorTheme: z.string().optional().nullable(),
  status: z.enum(["DRAFT", "PUBLISHED", "CANCELLED", "COMPLETED", "ARCHIVED"]).default("DRAFT"),
  visibility: z.enum(["PUBLIC", "MEMBERS_ONLY", "PRIVATE"]).default("PUBLIC"),
  registrationOpenDate: z.string().optional().nullable().refine((v) => !v || !isNaN(Date.parse(v)), "Invalid open date"),
  registrationCloseDate: z.string().optional().nullable().refine((v) => !v || !isNaN(Date.parse(v)), "Invalid close date"),
  seoTitle: z.string().optional().nullable(),
  seoDescription: z.string().optional().nullable(),
  branchId: z.string().optional().nullable(),
});

// ── GET /api/events ─────────────────────────────────────────────────────────────
// Supports advanced search, multi-filters, sorting, and cursor pagination
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const branchId = searchParams.get("branchId") || undefined;
    const category = searchParams.get("category") || undefined;
    const status = searchParams.get("status") || "PUBLISHED";
    const featured = searchParams.get("featured") === "true" ? true : undefined;
    const filterType = searchParams.get("filterType") || undefined; // upcoming, today, week, month
    const search = searchParams.get("search") || undefined;
    const sort = searchParams.get("sort") || "newest";
    const cursor = searchParams.get("cursor") || undefined;
    const limit = Math.min(parseInt(searchParams.get("limit") || "20"), 100);

    const where: any = { isDeleted: false };
    
    // Status
    if (status !== "ALL") {
      where.status = status;
    }

    // Branch
    if (branchId && branchId !== "ALL" && branchId !== "all") {
      where.branchId = branchId;
    }

    // Category
    if (category && category !== "ALL" && category !== "all") {
      where.category = category;
    }

    // Featured
    if (featured !== undefined) {
      where.featured = featured;
    }

    // Date filters
    const now = new Date();
    if (filterType === "upcoming") {
      where.date = { gte: now };
    } else if (filterType === "today") {
      const start = new Date();
      start.setHours(0, 0, 0, 0);
      const end = new Date();
      end.setHours(23, 59, 59, 999);
      where.date = { gte: start, lte: end };
    } else if (filterType === "week") {
      const start = new Date();
      const end = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      where.date = { gte: start, lte: end };
    } else if (filterType === "month") {
      const start = new Date();
      const end = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
      where.date = { gte: start, lte: end };
    }

    // Search query
    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { location: { contains: search, mode: "insensitive" } },
        { speaker: { contains: search, mode: "insensitive" } },
        { pastor: { contains: search, mode: "insensitive" } },
        { branch: { name: { contains: search, mode: "insensitive" } } },
      ];
    }

    // Sorting
    let orderBy: any = {};
    if (sort === "newest") {
      orderBy = { createdAt: "desc" };
    } else if (sort === "oldest") {
      orderBy = { createdAt: "asc" };
    } else if (sort === "upcoming") {
      orderBy = { date: "asc" };
    } else if (sort === "alphabetical") {
      orderBy = { title: "asc" };
    } else if (sort === "most_registered") {
      orderBy = { registrations: { _count: "desc" } };
    }

    // Pagination query parameters
    const queryOptions: any = {
      where,
      orderBy: [orderBy, { id: "asc" }], // Secondary sort for stable cursor
      take: limit + 1, // Fetch extra item to check if there is a next page
      include: {
        branch: { select: { id: true, name: true } },
        createdBy: { select: { id: true, name: true } },
        eventImages: true,
        eventVideos: true,
        _count: { select: { registrations: true } },
      },
    };

    if (cursor) {
      queryOptions.cursor = { id: cursor };
      queryOptions.skip = 1;
    }

    const events = await prisma.event.findMany(queryOptions);

    let nextCursor: string | undefined = undefined;
    if (events.length > limit) {
      const nextItem = events.pop();
      nextCursor = nextItem?.id;
    }

    return NextResponse.json({
      success: true,
      events,
      nextCursor,
    });
  } catch (err: any) {
    console.error("[API/EVENTS/GET] Error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to load events." },
      { status: 500 }
    );
  }
}

// ── POST /api/events ────────────────────────────────────────────────────────────
// Create dynamic event - requires Super Admin, Admin or Event Manager
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

    const data = parsed.data;

    // Generate unique slug
    let slug = data.slug ? slugify(data.slug) : slugify(data.title);
    const existingEvent = await prisma.event.findUnique({
      where: { slug },
    });
    if (existingEvent) {
      slug = `${slug}-${Math.random().toString(36).substring(2, 6)}`;
    }

    // Ensure Creator User exists in DB
    const existingUser = await prisma.user.findUnique({
      where: { id: auth.uid },
    });
    if (!existingUser) {
      await prisma.user.create({
        data: {
          id: auth.uid,
          name: auth.name || "Dev User",
          email: auth.email || "dev@kcm.local",
          password: "dev_bypass_password_hash",
          role: auth.role || "EVENT_MANAGER",
        },
      });
    }

    // Create event
    const event = await prisma.event.create({
      data: {
        title: data.title,
        slug,
        shortDescription: data.shortDescription,
        description: data.description,
        date: new Date(data.date),
        endDate: data.endDate ? new Date(data.endDate) : null,
        time: data.time,
        endTime: data.endTime,
        timezone: data.timezone,
        location: data.location,
        googleMapsUrl: data.googleMapsUrl,
        category: data.category,
        organizer: data.organizer,
        speaker: data.speaker,
        pastor: data.pastor,
        contactPerson: data.contactPerson,
        contactPhone: data.contactPhone,
        contactEmail: data.contactEmail,
        registrationRequired: data.registrationRequired,
        registrationLimit: data.registrationLimit,
        remainingSeats: data.registrationRequired ? (data.registrationLimit || 0) : null,
        image: data.image || null,
        coverImagePublicId: data.coverImagePublicId || null,
        eventBanner: data.eventBanner || null,
        eventBannerPublicId: data.eventBannerPublicId || null,
        tags: data.tags,
        featured: data.featured,
        priority: data.priority,
        colorTheme: data.colorTheme,
        status: data.status,
        visibility: data.visibility,
        registrationOpenDate: data.registrationOpenDate ? new Date(data.registrationOpenDate) : null,
        registrationCloseDate: data.registrationCloseDate ? new Date(data.registrationCloseDate) : null,
        seoTitle: data.seoTitle,
        seoDescription: data.seoDescription,
        isPublished: data.status === "PUBLISHED",
        branchId: data.branchId || null,
        createdById: auth.uid,
      },
      include: {
        branch: true,
        createdBy: { select: { name: true } },
      },
    });

    // ── Real-time Notification Dispatches ────────────────────────────────────
    if (event.status === "PUBLISHED") {
      await notifyEventActivity(
        event.id,
        "NEW_EVENT",
        `New Event: ${event.title}`,
        `A new event "${event.title}" has been scheduled at ${event.location} on ${new Date(event.date).toLocaleDateString("en-IN")}.`,
        `/events/${event.slug}`,
        {
          title: event.title,
          location: event.location,
          date: event.date,
          coverImage: event.image || undefined,
        }
      );

      // Broadcast event.created
      await triggerSocketBroadcast("event.created", {
        id: event.id,
        title: event.title,
        slug: event.slug,
        shortDescription: event.shortDescription,
        date: event.date,
        time: event.time,
        location: event.location,
        category: event.category,
        branchName: event.branch?.name || "General",
        image: event.image,
      });
    }

    // Log Audit event
    await logAuditEvent(
      auth.uid,
      "EVENT_CREATE",
      `Event "${event.title}" created in state ${event.status} under slug ${event.slug}.`
    );

    return NextResponse.json({ success: true, event }, { status: 201 });
  } catch (err: any) {
    console.error("[API/EVENTS/POST] Error creating event:", err);
    return NextResponse.json(
      { error: err.message || "Failed to create event." },
      { status: 500 }
    );
  }
}
