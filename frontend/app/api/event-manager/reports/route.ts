import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireEventManagerOrDev, requireFieldVolunteerOrDev } from "@/lib/authMiddleware";

export const dynamic = "force-dynamic";

// GET /api/event-manager/reports
// Fetch list of field reports with filters
export async function GET(req: Request) {
  const auth = await requireFieldVolunteerOrDev(req);
  if (auth instanceof NextResponse) return auth;

  try {
    const { searchParams } = new URL(req.url);
    const branchId = searchParams.get("branchId") || undefined;
    const status = searchParams.get("status") || undefined;

    const where: any = {};
    if (branchId && branchId !== "all") {
      where.branchId = branchId;
    }
    if (status && status !== "all") {
      where.status = status;
    }

    const reports = await prisma.eventReport.findMany({
      where,
      orderBy: { reportDate: "desc" },
      include: {
        branch: true,
        media: true,
        createdBy: {
          select: { name: true, email: true },
        },
      },
    });

    return NextResponse.json({ success: true, reports });
  } catch (err: any) {
    console.error("[API/EVENT_MANAGER/GET] Error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to load reports." },
      { status: 500 }
    );
  }
}

// PUT /api/event-manager/reports
// Update report status (Approve / Reject)
export async function PUT(req: Request) {
  const auth = await requireEventManagerOrDev(req);
  if (auth instanceof NextResponse) return auth;

  try {
    const body = await req.json();
    const { reportId, status } = body;

    if (!reportId || !status || !["PENDING", "APPROVED", "REJECTED"].includes(status)) {
      return NextResponse.json(
        { error: "Invalid parameters. ReportId and valid status required." },
        { status: 400 }
      );
    }

    const updatedReport = await prisma.eventReport.update({
      where: { id: reportId },
      data: { status },
      include: { branch: true, media: true },
    });

    // ── Auto Publishing Engine ──────────────────────────────────────────────
    if (status === "APPROVED") {
      try {
        // 1. Create the public Event record
        const newEvent = await prisma.event.create({
          data: {
            title: updatedReport.title,
            description: updatedReport.description,
            date: updatedReport.reportDate,
            time: "10:00 AM", // default church service time
            location: updatedReport.branch.name,
            category: "SPECIAL", // default category for branch activities
            status: "PUBLISHED",
            branchId: updatedReport.branchId,
            createdById: updatedReport.createdById,
            image: updatedReport.media.length > 0 ? updatedReport.media[0].url : null,
          }
        });

        // 2. Map MediaReport attachments to public EventMedia and Gallery items
        for (const item of updatedReport.media) {
          // Copy to EventMedia
          await prisma.eventMedia.create({
            data: {
              eventId: newEvent.id,
              imageUrl: item.url,
              caption: updatedReport.title,
              uploadedById: item.uploadedById,
            }
          });

          // Copy to Gallery for live website integration
          await prisma.gallery.create({
            data: {
              title: updatedReport.title,
              description: updatedReport.description,
              imageUrl: item.url,
              category: item.type === "VIDEO" ? "Outreach" : "Events",
            }
          });
        }

        // 3. Trigger Socket.io real-time update for live website updates
        try {
          await fetch("http://localhost:3001/api/trigger-event", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              type: "new-event",
              payload: {
                id: newEvent.id,
                title: newEvent.title,
                description: newEvent.description,
                date: newEvent.date,
                location: newEvent.location,
                category: newEvent.category,
                status: newEvent.status,
                branchName: updatedReport.branch.name,
                image: newEvent.image,
              },
            }),
          });
        } catch (wsErr) {
          // Ignore websocket connection issues
        }

      } catch (pubErr) {
        console.error("[API/EVENT_MANAGER/AUTO_PUBLISH] Fail:", pubErr);
      }
    }

    // Create DB notification for status change
    await prisma.notification.create({
      data: {
        type: "FIELD_REPORT_STATUS",
        title: `Report ${status.toLowerCase()}`,
        content: `Report "${updatedReport.title}" for ${updatedReport.branch.name} has been ${status.toLowerCase()}.`,
        link: `/event-manager?reportId=${updatedReport.id}`,
      },
    });

    // Webhook notification to Socket.io helper
    try {
      await fetch("http://localhost:3001/api/trigger-event", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "report_status_changed",
          payload: {
            id: updatedReport.id,
            title: updatedReport.title,
            branchName: updatedReport.branch.name,
            status,
          },
        }),
      });
    } catch (wsErr) {
      // Quietly log and bypass if Socket.io server is offline
    }

    return NextResponse.json({ success: true, report: updatedReport });
  } catch (err: any) {
    console.error("[API/EVENT_MANAGER/PUT] Error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to update report status." },
      { status: 500 }
    );
  }
}
