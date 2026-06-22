import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireFieldVolunteerOrDev } from "@/lib/authMiddleware";
import { promises as fs } from "fs";
import path from "path";

export async function POST(req: Request) {
  // 1. Authenticate user
  const auth = await requireFieldVolunteerOrDev(req);
  if (auth instanceof NextResponse) return auth;

  try {
    const body = await req.json();
    const { 
      branchId, 
      branchName, 
      title, 
      description, 
      attendanceCount, 
      offeringAmount, 
      reportDate, 
      gpsLocation, 
      volunteerNames, 
      images 
    } = body;

    if (!branchId || !title || !description) {
      return NextResponse.json(
        { error: "Branch, Title, and Daily Notes are required." },
        { status: 400 }
      );
    }

    // 2. Create the EventReport record
    const report = await prisma.eventReport.create({
      data: {
        branchId,
        title,
        description,
        attendanceCount: attendanceCount || 0,
        offeringAmount: offeringAmount || 0,
        reportDate: new Date(reportDate),
        gpsLocation: gpsLocation || null,
        volunteerNames: volunteerNames || [],
        createdById: auth.uid,
      },
    });

    // 3. Process and write images to public/uploads
    const uploadedMedia = [];
    if (images && Array.isArray(images) && images.length > 0) {
      // Ensure upload directory exists
      const uploadDir = path.join(process.cwd(), "public", "uploads");
      await fs.mkdir(uploadDir, { recursive: true });

      for (let i = 0; i < images.length; i++) {
        const base64Str = images[i];
        const matches = base64Str.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
        
        if (!matches || matches.length !== 3) {
          console.warn(`[API/REPORT] Skipping invalid base64 image string at index ${i}`);
          continue;
        }

        const mimeType = matches[1];
        const buffer = Buffer.from(matches[2], "base64");
        const extension = mimeType.split("/")[1] || "jpg";
        
        const filename = `report-${report.id}-${Date.now()}-${i}.${extension}`;
        const relativeUrl = `/uploads/${filename}`;
        const absolutePath = path.join(uploadDir, filename);

        // Write buffer to file system
        await fs.writeFile(absolutePath, buffer);

        // Create MediaReport model record
        const mediaRecord = await prisma.mediaReport.create({
          data: {
            eventReportId: report.id,
            type: "IMAGE",
            url: relativeUrl,
            uploadedById: auth.uid,
          },
        });

        uploadedMedia.push(mediaRecord);
      }
    }

    // 4. Create standard DB Notification item
    const notifContent = `Branch: ${branchName}. Attendance: ${attendanceCount}. ${uploadedMedia.length} images added.`;
    await prisma.notification.create({
      data: {
        type: "FIELD_REPORT",
        title: `New Event Report: ${title}`,
        content: notifContent,
        link: `/event-manager?reportId=${report.id}`,
      },
    });

    // 5. Fire webhook to trigger Socket.io notification
    try {
      await fetch("http://localhost:3001/api/trigger-event", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "new_event_report",
          payload: {
            id: report.id,
            branchName,
            title,
            attendanceCount,
            imagesCount: uploadedMedia.length,
          },
        }),
      });
    } catch (wsErr) {
      // Quietly log and bypass if Socket.io server is not booted yet
      console.log("[API/REPORT] Real-time socket trigger bypassed (Express helper offline).");
    }

    return NextResponse.json({ 
      success: true, 
      reportId: report.id, 
      mediaCount: uploadedMedia.length 
    });
  } catch (err: any) {
    console.error("[API/REPORT] Submission error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to submit field report." },
      { status: 500 }
    );
  }
}
