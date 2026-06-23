import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireStaffOrDev } from "@/lib/authMiddleware";

export const dynamic = "force-dynamic";

// POST /api/events/publish
// Manually publishes a field report into a public Event
export async function POST(req: Request) {
  const auth = await requireStaffOrDev(req);
  if (auth instanceof NextResponse) return auth;

  try {
    const body = await req.json();
    const { reportId } = body;

    if (!reportId) {
      return NextResponse.json(
        { error: "Report ID is required." },
        { status: 400 }
      );
    }

    const report = await prisma.eventReport.findUnique({
      where: { id: reportId },
      include: { media: true, branch: true }
    });

    if (!report) {
      return NextResponse.json(
        { error: "Report not found." },
        { status: 404 }
      );
    }

    // Update report status
    await prisma.eventReport.update({
      where: { id: reportId },
      data: { status: "APPROVED" }
    });

    // Create the public Event
    const event = await prisma.event.create({
      data: {
        title: report.title,
        description: report.description,
        date: report.reportDate,
        time: "10:00 AM", // default time
        location: report.branch.name,
        category: "SPECIAL",
        status: "PUBLISHED",
        branchId: report.branchId,
        createdById: report.createdById,
        image: report.media.length > 0 ? report.media[0].url : null,
      }
    });

    // Copy media
    for (const media of report.media) {
      await prisma.eventMedia.create({
        data: {
          eventId: event.id,
          imageUrl: media.url,
          caption: report.title,
          uploadedById: media.uploadedById,
        }
      });

      await prisma.gallery.create({
        data: {
          title: report.title,
          description: report.description,
          imageUrl: media.url,
          category: media.type === "VIDEO" ? "Outreach" : "Events",
        }
      });
    }

    // Trigger Socket.io real-time update
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
            branchName: report.branch.name,
            image: event.image,
          },
        }),
      });
    } catch {
      // Ignore websocket connection issues
    }

    return NextResponse.json({ success: true, event });
  } catch (err: any) {
    console.error("[API/EVENTS/PUBLISH] Error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to publish event." },
      { status: 500 }
    );
  }
}
