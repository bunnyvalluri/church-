import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireEventManagerOrDev } from "@/lib/authMiddleware";
import { logAuditEvent } from "@/lib/eventServices";

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
    });

    if (!event) {
      return NextResponse.json({ error: "Event to duplicate not found." }, { status: 404 });
    }

    const title = `${event.title} - Copy`;
    let slug = `${event.slug}-copy`;
    
    // Ensure unique slug
    const existing = await prisma.event.findUnique({ where: { slug } });
    if (existing) {
      slug = `${slug}-${Math.random().toString(36).substring(2, 6)}`;
    }

    // Clone event (resetting registrations, images, videos, reports)
    const duplicated = await prisma.event.create({
      data: {
        title,
        slug,
        shortDescription: event.shortDescription,
        description: event.description,
        date: event.date,
        endDate: event.endDate,
        time: event.time,
        endTime: event.endTime,
        timezone: event.timezone,
        location: event.location,
        googleMapsUrl: event.googleMapsUrl,
        category: event.category,
        organizer: event.organizer,
        speaker: event.speaker,
        pastor: event.pastor,
        contactPerson: event.contactPerson,
        contactPhone: event.contactPhone,
        contactEmail: event.contactEmail,
        registrationRequired: event.registrationRequired,
        registrationLimit: event.registrationLimit,
        remainingSeats: event.registrationRequired ? event.registrationLimit : null,
        image: event.image,
        coverImagePublicId: event.coverImagePublicId,
        eventBanner: event.eventBanner,
        eventBannerPublicId: event.eventBannerPublicId,
        tags: event.tags,
        featured: false, // Default to not featured
        priority: event.priority,
        colorTheme: event.colorTheme,
        status: "DRAFT", // Duplicated events always start as DRAFT
        visibility: event.visibility,
        registrationOpenDate: event.registrationOpenDate,
        registrationCloseDate: event.registrationCloseDate,
        seoTitle: event.seoTitle ? `${event.seoTitle} - Copy` : null,
        seoDescription: event.seoDescription,
        branchId: event.branchId,
        createdById: auth.uid,
      },
    });

    // Log Audit Log
    await logAuditEvent(
      auth.uid,
      "EVENT_DUPLICATE",
      `Duplicated event "${event.title}" (${event.id}) to new draft "${duplicated.title}" (${duplicated.id}).`
    );

    return NextResponse.json({ success: true, event: duplicated });
  } catch (err: any) {
    console.error("[API/EVENTS/DUPLICATE] Error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to duplicate event." },
      { status: 500 }
    );
  }
}
