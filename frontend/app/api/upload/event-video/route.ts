import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireEventManagerOrDev } from "@/lib/authMiddleware";
import { validateFileSecurity } from "@/lib/uploadSecurity";
import { uploadBufferToCloudinary } from "@/lib/cloudinary";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const auth = await requireEventManagerOrDev(req);
  if (auth instanceof NextResponse) return auth;

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const eventId = formData.get("eventId") as string | null;
    const caption = formData.get("caption") as string | null;

    if (!file) {
      return NextResponse.json({ error: "No video file provided." }, { status: 400 });
    }
    if (!eventId) {
      return NextResponse.json({ error: "Event ID is required." }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    // Security validation (Max 50MB for video)
    const validation = validateFileSecurity(buffer, file.name, file.type);
    if (!validation.isValid) {
      return NextResponse.json({ error: validation.error }, { status: 422 });
    }

    // Phase 6: Video upload to Cloudinary with compression & streaming URLs
    const uploadResult = await uploadBufferToCloudinary(buffer, "events", "video");

    // Phase 7: Save in PostgreSQL DB
    const eventMedia = await prisma.eventMedia.create({
      data: {
        eventId,
        imageUrl: uploadResult.secure_url, // Contains streaming ready mp4 URL
        publicId: uploadResult.public_id,
        caption: caption || `Video: ${file.name}`,
        uploadedById: auth.uid,
      },
    });

    // Phase 10: Trigger Socket.io notification
    try {
      await fetch("http://localhost:3001/api/trigger-event", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "media-uploaded",
          payload: {
            id: eventMedia.id,
            eventId,
            type: "VIDEO",
            url: uploadResult.secure_url,
            publicId: uploadResult.public_id,
            uploadedBy: auth.name || "Event Manager",
            timestamp: new Date(),
          },
        }),
      });
    } catch {
      // Ignore socket offline
    }

    return NextResponse.json({
      success: true,
      media: eventMedia,
      cloudinary: {
        publicId: uploadResult.public_id,
        url: uploadResult.secure_url,
        duration: uploadResult.duration,
        format: uploadResult.format,
      },
    });
  } catch (err: any) {
    console.error("[API/UPLOAD/EVENT-VIDEO] Error:", err);
    return NextResponse.json({ error: err.message || "Video upload failed." }, { status: 500 });
  }
}
