import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireEventManagerOrDev } from "@/lib/authMiddleware";

export const dynamic = "force-dynamic";

// ── Allowed MIME types ────────────────────────────────────────────────────────
const ALLOWED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

// ── POST /api/events/[id]/upload ──────────────────────────────────────────────
// Upload images to Cloudinary and attach to event
export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  const auth = await requireEventManagerOrDev(req);
  if (auth instanceof NextResponse) return auth;

  try {
    // Verify event exists
    const event = await prisma.event.findUnique({
      where: { id: params.id },
      select: { id: true, title: true },
    });

    if (!event) {
      return NextResponse.json({ error: "Event not found." }, { status: 404 });
    }

    // Parse multipart form data
    const formData = await req.formData();
    const files = formData.getAll("images[]") as File[];

    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: "No files provided. Send images[] in multipart form." },
        { status: 400 }
      );
    }

    if (files.length > 10) {
      return NextResponse.json(
        { error: "Maximum 10 images per upload batch." },
        { status: 400 }
      );
    }

    // ── Validate each file using binary security signatures ─────────────────
    const { validateFileSecurity } = await import("@/lib/uploadSecurity");
    for (const file of files) {
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const valResult = validateFileSecurity(buffer, file.name, file.type);
      if (!valResult.isValid) {
        return NextResponse.json({ error: `Security validation failed for ${file.name}: ${valResult.error}` }, { status: 400 });
      }
    }

    // ── Upload to Cloudinary ───────────────────────────────────────────────
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || process.env.CLOUDINARY_CLOUD_NAME;
    const uploadPreset = process.env.CLOUDINARY_UPLOAD_PRESET || "kcm_events_unsigned";
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    const uploadedMedia: { imageUrl: string; publicId: string }[] = [];
    const errors: string[] = [];

    for (const file of files) {
      try {
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const base64 = buffer.toString("base64");
        const dataUri = `data:${file.type};base64,${base64}`;
        const resourceType = file.type.startsWith("video/") ? "video" : "image";

        let uploadUrl: string;
        let uploadBody: URLSearchParams;

        if (apiKey && apiSecret) {
          const timestamp = Math.round(Date.now() / 1000);
          const paramsToSign = `folder=kcm/events/${params.id}&timestamp=${timestamp}`;
          const crypto = await import("crypto");
          const signature = crypto.createHash("sha256").update(paramsToSign + apiSecret).digest("hex");

          uploadUrl = `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`;
          uploadBody = new URLSearchParams({
            file: dataUri,
            api_key: apiKey,
            timestamp: String(timestamp),
            signature,
            folder: `kcm/events/${params.id}`,
          });
        } else {
          uploadUrl = `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`;
          uploadBody = new URLSearchParams({
            file: dataUri,
            upload_preset: uploadPreset,
            folder: `kcm/events/${params.id}`,
          });
        }

        const cloudRes = await fetch(uploadUrl, { method: "POST", body: uploadBody });
        if (!cloudRes.ok) {
          const errText = await cloudRes.text();
          errors.push(`Failed to upload ${file.name}: ${errText}`);
          continue;
        }

        const cloudData = await cloudRes.json();
        uploadedMedia.push({
          imageUrl: cloudData.secure_url,
          publicId: cloudData.public_id,
        });
      } catch (uploadErr: any) {
        errors.push(`Upload error for ${file.name}: ${uploadErr.message}`);
      }
    }

    if (uploadedMedia.length === 0) {
      return NextResponse.json({ error: "All uploads failed.", details: errors }, { status: 500 });
    }

    // ── Save to database ───────────────────────────────────────────────────
    const savedMedia = await prisma.$transaction(
      uploadedMedia.map((m) =>
        prisma.eventMedia.create({
          data: {
            eventId: params.id,
            imageUrl: m.imageUrl,
            publicId: m.publicId,
            uploadedById: auth.uid,
          },
        })
      )
    );

    // ── Notification & Realtime Socket ──────────────────────────────────────
    const companionUrl = process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3001";
    try {
      await fetch(`${companionUrl}/api/trigger-event`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "event:uploaded",
          payload: {
            eventId: params.id,
            eventTitle: event.title,
            imagesCount: savedMedia.length,
            title: `New Event Uploaded`,
            description: `${savedMedia.length} Media items added to ${event.title}`,
            uploadedBy: auth.name || auth.email,
            thumbnailUrl: savedMedia[0]?.imageUrl,
            popupType: "event-images-uploaded",
          },
        }),
      });
    } catch { /* Socket offline — skip */ }

    // ── FCM Push Notification ───────────────────────────────────────────────
    try {
      const dtModel = (prisma as any).deviceToken;
      const deviceRecords = dtModel ? await dtModel.findMany({ select: { token: true }, take: 500 }) : [];
      const tokens = deviceRecords.map((d: any) => d.token);
      if (tokens.length > 0) {
        const { sendPushNotification } = await import("@/lib/firebaseAdmin");
        await sendPushNotification(
          tokens,
          `New Event Uploaded`,
          `${savedMedia.length} media items added to ${event.title}`,
          { link: `/event-manager`, eventId: params.id }
        );
      }
    } catch (pushErr) {
      console.warn("[API/EVENTS/UPLOAD] Push notification warning:", pushErr);
    }

    return NextResponse.json({
      success: true,
      uploaded: savedMedia.length,
      failed: errors.length,
      media: savedMedia,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (err: any) {
    console.error("[API/EVENTS/UPLOAD] Error:", err);
    return NextResponse.json(
      { error: err.message || "Upload failed." },
      { status: 500 }
    );
  }
}
