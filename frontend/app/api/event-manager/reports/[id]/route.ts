import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireFieldVolunteerOrDev } from "@/lib/authMiddleware";
import { promises as fs } from "fs";
import fsSync from "fs";
import path from "path";

export const dynamic = "force-dynamic";

// GET /api/event-manager/reports/[id]
// Retrieve details of a single report
export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const auth = await requireFieldVolunteerOrDev(req);
  if (auth instanceof NextResponse) return auth;

  try {
    const report = await prisma.eventReport.findUnique({
      where: { id: params.id },
      include: {
        branch: true,
        media: true,
        createdBy: {
          select: { name: true, email: true },
        },
      },
    });

    if (!report) {
      return NextResponse.json({ error: "Report not found." }, { status: 404 });
    }

    return NextResponse.json({ success: true, report });
  } catch (err: any) {
    console.error("[API/EVENT_MANAGER/REPORTS/ID/GET] Error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to load report." },
      { status: 500 }
    );
  }
}

// PUT /api/event-manager/reports/[id]
// Update report details (content edit, removed media, new media attachments)
export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  const auth = await requireFieldVolunteerOrDev(req);
  if (auth instanceof NextResponse) return auth;

  try {
    const report = await prisma.eventReport.findUnique({
      where: { id: params.id },
      include: { media: true },
    });

    if (!report) {
      return NextResponse.json({ error: "Report not found." }, { status: 404 });
    }

    // Authorization check: Event Managers/Admins can edit any report, volunteers can only edit their own
    const isManagerOrAdmin = ["SUPER_ADMIN", "ADMIN", "EVENT_MANAGER"].includes(auth.role);
    if (!isManagerOrAdmin && report.createdById !== auth.uid) {
      return NextResponse.json(
        { error: "Access denied. You can only modify your own reports." },
        { status: 403 }
      );
    }

    const body = await req.json();
    const {
      branchId,
      title,
      description,
      attendanceCount,
      offeringAmount,
      reportDate,
      gpsLocation,
      volunteerNames,
      removedMediaIds,
      newImages,
      newVideos,
    } = body;

    if (!branchId || !title || !description) {
      return NextResponse.json(
        { error: "Branch, Title, and Daily Notes are required." },
        { status: 400 }
      );
    }

    // 1. Process removed media
    if (removedMediaIds && Array.isArray(removedMediaIds)) {
      const publicDir = path.join(process.cwd(), "public");
      for (const mediaId of removedMediaIds) {
        const mediaItem = report.media.find((m) => m.id === mediaId);
        if (mediaItem) {
          // Unlink the file from filesystem
          const absolutePath = path.join(publicDir, mediaItem.url.split("/").join(path.sep));
          try {
            if (fsSync.existsSync(absolutePath)) {
              await fs.unlink(absolutePath);
            }
          } catch (fsErr) {
            console.warn(`[API/EVENT_MANAGER/REPORTS/ID/PUT] File unlink failed at ${absolutePath}:`, fsErr);
          }

          // Delete record from Database
          await prisma.mediaReport.delete({
            where: { id: mediaId },
          });
        }
      }
    }

    // 2. Update report properties
    await prisma.eventReport.update({
      where: { id: params.id },
      data: {
        branchId,
        title,
        description,
        attendanceCount: attendanceCount !== undefined ? Number(attendanceCount) : report.attendanceCount,
        offeringAmount: offeringAmount !== undefined ? Number(offeringAmount) : report.offeringAmount,
        reportDate: reportDate ? new Date(reportDate) : report.reportDate,
        gpsLocation: gpsLocation !== undefined ? gpsLocation : report.gpsLocation,
        volunteerNames: volunteerNames || report.volunteerNames,
      },
    });

    // 3. Process new media attachments
    const { validateFileSecurity } = await import("@/lib/uploadSecurity");
    const uploadDir = path.join(process.cwd(), "public", "uploads");
    await fs.mkdir(uploadDir, { recursive: true });

    const mimeExtensions: Record<string, string> = {
      "image/jpeg": ".jpg",
      "image/jpg": ".jpg",
      "image/png": ".png",
      "image/webp": ".webp",
      "video/mp4": ".mp4",
      "video/webm": ".webm",
    };

    const processAttachment = async (base64Str: string, isVideo: boolean, index: number) => {
      const matches = base64Str.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
      if (!matches || matches.length !== 3) {
        throw new Error(`Invalid base64 payload at index ${index}`);
      }

      const mimeType = matches[1];
      const buffer = Buffer.from(matches[2], "base64");
      const ext = mimeExtensions[mimeType] || (isVideo ? ".mp4" : ".jpg");
      const filename = `report-${params.id}-${Date.now()}-${isVideo ? "video" : "image"}-${index}${ext}`;
      const relativeUrl = `/uploads/${filename}`;
      const absolutePath = path.join(uploadDir, filename);

      // Security check
      const securityCheck = validateFileSecurity(buffer, filename, mimeType);
      if (!securityCheck.isValid) {
        throw new Error(`Security validation failed: ${securityCheck.error}`);
      }

      await fs.writeFile(absolutePath, buffer);

      // Create Database MediaReport
      await prisma.mediaReport.create({
        data: {
          eventReportId: params.id,
          type: isVideo ? "VIDEO" : "IMAGE",
          url: relativeUrl,
          uploadedById: auth.uid,
        },
      });
    };

    // Save images
    if (newImages && Array.isArray(newImages)) {
      for (let i = 0; i < newImages.length; i++) {
        await processAttachment(newImages[i], false, i);
      }
    }

    // Save videos
    if (newVideos && Array.isArray(newVideos)) {
      for (let i = 0; i < newVideos.length; i++) {
        await processAttachment(newVideos[i], true, i);
      }
    }

    // Retrieve the fully updated report with its media and creator details
    const finalReport = await prisma.eventReport.findUnique({
      where: { id: params.id },
      include: {
        branch: true,
        media: true,
        createdBy: {
          select: { name: true, email: true },
        },
      },
    });

    // Notify via real-time WebSocket server
    try {
      await fetch("http://localhost:3001/api/trigger-event", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "report_status_changed", // Re-fetch trigger on clients
          payload: {
            id: params.id,
            title: updatedReport.title,
            branchName: finalReport?.branch?.name || "Branch",
            status: finalReport?.status || "PENDING",
          },
        }),
      });
    } catch (wsErr) {
      // Bypassed if offline helper
    }

    return NextResponse.json({ success: true, report: finalReport });
  } catch (err: any) {
    console.error("[API/EVENT_MANAGER/REPORTS/ID/PUT] Error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to update report." },
      { status: 500 }
    );
  }
}

// DELETE /api/event-manager/reports/[id]
// Delete report and clean up physical attachments on disk
export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  const auth = await requireFieldVolunteerOrDev(req);
  if (auth instanceof NextResponse) return auth;

  try {
    const report = await prisma.eventReport.findUnique({
      where: { id: params.id },
      include: { media: true },
    });

    if (!report) {
      return NextResponse.json({ error: "Report not found." }, { status: 404 });
    }

    // Authorization check: Event Managers/Admins can delete any report, volunteers can only delete their own
    const isManagerOrAdmin = ["SUPER_ADMIN", "ADMIN", "EVENT_MANAGER"].includes(auth.role);
    if (!isManagerOrAdmin && report.createdById !== auth.uid) {
      return NextResponse.json(
        { error: "Access denied. You do not have permission to delete this report." },
        { status: 403 }
      );
    }

    // 1. Remove physical files associated with the report
    const publicDir = path.join(process.cwd(), "public");
    for (const item of report.media) {
      const absolutePath = path.join(publicDir, item.url.split("/").join(path.sep));
      try {
        if (fsSync.existsSync(absolutePath)) {
          await fs.unlink(absolutePath);
        }
      } catch (fsErr) {
        console.warn(`[API/EVENT_MANAGER/REPORTS/ID/DELETE] Physical file removal failed at ${absolutePath}:`, fsErr);
      }
    }

    // 2. Delete report. Prisma cascade delete takes care of MediaReport table rows
    await prisma.eventReport.delete({
      where: { id: params.id },
    });

    // 3. Notify companion socket
    try {
      await fetch("http://localhost:3001/api/trigger-event", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "report_deleted",
          payload: {
            id: params.id,
            title: report.title,
          },
        }),
      });
    } catch (wsErr) {
      // Quiet ignore
    }

    return NextResponse.json({ success: true, message: "Report deleted successfully." });
  } catch (err: any) {
    console.error("[API/EVENT_MANAGER/REPORTS/ID/DELETE] Error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to delete report." },
      { status: 500 }
    );
  }
}
