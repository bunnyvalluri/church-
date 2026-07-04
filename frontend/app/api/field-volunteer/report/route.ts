import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireFieldVolunteerOrDev } from "@/lib/authMiddleware";
import { promises as fs } from "fs";
import path from "path";

export const dynamic = "force-dynamic";

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
      images,
      videos
    } = body;

    if (!branchId || !title || !description) {
      return NextResponse.json(
        { error: "Branch, Title, and Daily Notes are required." },
        { status: 400 }
      );
    }

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
          role: auth.role || "FIELD_VOLUNTEER"
        }
      });
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

    const { validateFileSecurity } = await import("@/lib/uploadSecurity");
    const { uploadBufferToCloudinary } = await import("@/lib/cloudinary");
    const uploadedMedia = [];

    // Helper to process a base64 media attachment
    const processAttachment = async (base64Str: string, isVideo: boolean, index: number) => {
      const matches = base64Str.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
      if (!matches || matches.length !== 3) {
        throw new Error(`Invalid base64 payload at index ${index}`);
      }

      const mimeType = matches[1];
      const buffer = Buffer.from(matches[2], "base64");
      const filename = `report-${report.id}-${Date.now()}-${isVideo ? "video" : "image"}-${index}`;

      // Perform security check (virus/mime validation)
      const securityCheck = validateFileSecurity(buffer, filename, mimeType);
      if (!securityCheck.isValid) {
        throw new Error(`Security validation failed: ${securityCheck.error}`);
      }

      // Upload directly to Cloudinary
      const cloudinaryResult = await uploadBufferToCloudinary(
        buffer,
        "volunteer",
        isVideo ? "video" : "image"
      );

      // Save in MediaReport DB table (using the Cloudinary secure_url!)
      const mediaRecord = await prisma.mediaReport.create({
        data: {
          eventReportId: report.id,
          type: isVideo ? "VIDEO" : "IMAGE",
          url: cloudinaryResult.secure_url,
          uploadedById: auth.uid,
        },
      });

      uploadedMedia.push(mediaRecord);
    };

    // Process Images
    if (images && Array.isArray(images)) {
      for (let i = 0; i < images.length; i++) {
        try {
          await processAttachment(images[i], false, i);
        } catch (err: any) {
          console.error(`[API/REPORT] Image process error:`, err);
          return NextResponse.json({ error: err.message || "Failed to process image attachment." }, { status: 400 });
        }
      }
    }

    // Process Videos
    if (videos && Array.isArray(videos)) {
      for (let i = 0; i < videos.length; i++) {
        try {
          await processAttachment(videos[i], true, i);
        } catch (err: any) {
          console.error(`[API/REPORT] Video process error:`, err);
          return NextResponse.json({ error: err.message || "Failed to process video attachment." }, { status: 400 });
        }
      }
    }

    // ── NOTIFICATION PIPELINE ──────────────────────────────────────────────────

    // 4. Create standard DB Notification item
    const notifContent = `Branch: ${branchName}. Attendance: ${attendanceCount}. ${uploadedMedia.length} attachments added.`;
    await prisma.notification.create({
      data: {
        type: "FIELD_REPORT",
        title: `New Event Report: ${title}`,
        content: notifContent,
        link: `/event-manager?reportId=${report.id}`,
      },
    });

    // 5. Socket.io — emit report-submitted (triggers website popup + landing page refresh)
    const companionUrl = process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3001";
    try {
      // Emit report-submitted for landing page auto-refresh
      await fetch(`${companionUrl}/api/trigger-event`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "report-submitted",
          payload: {
            id: report.id,
            title,
            branchName,
            attendanceCount,
            offeringAmount,
            mediaCount: uploadedMedia.length,
            submittedBy: auth.name || "Field Volunteer",
            timestamp: new Date(),
          },
        }),
      });

      // Emit notification:popup for live website header popup
      await fetch(`${companionUrl}/api/trigger-event`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "notification:popup",
          payload: {
            title: "📋 New Event Report Submitted",
            description: `"${title}" from ${branchName} • ${attendanceCount} attended`,
            popupType: "report-submitted",
            link: `/event-manager`,
            icon: "upload",
            timestamp: new Date(),
          },
        }),
      });
    } catch (socketErr) {
      console.warn("[API/REPORT] Socket companion broadcast skipped:", socketErr);
    }

    // 6. FCM Push Notification to all registered device tokens
    try {
      const { sendPushNotification } = await import("@/lib/firebaseAdmin");
      const deviceTokenModel = (prisma as any).deviceToken;
      const deviceRecords = deviceTokenModel
        ? await deviceTokenModel.findMany({ select: { token: true }, take: 500 })
        : [];
      const tokens = deviceRecords.map((d: any) => d.token);

      if (tokens.length > 0) {
        await sendPushNotification(
          tokens,
          "📋 New Event Report",
          `"${title}" submitted from ${branchName} — ${attendanceCount} people attended`,
          { link: "/event-manager", reportId: report.id, branchName: branchName || "" }
        );
      }
    } catch (pushErr) {
      console.warn("[API/REPORT] FCM Push notification skipped:", pushErr);
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
