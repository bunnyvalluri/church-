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
      include: { branch: true },
    });

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
