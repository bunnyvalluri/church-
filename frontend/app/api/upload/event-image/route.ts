import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireEventManagerOrDev } from "@/lib/authMiddleware";
import { validateFileSecurity } from "@/lib/uploadSecurity";
import { uploadBufferToCloudinary, TargetFolderType } from "@/lib/cloudinary";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const auth = await requireEventManagerOrDev(req);
  if (auth instanceof NextResponse) return auth;

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const eventId = formData.get("eventId") as string | null;
    const caption = formData.get("caption") as string | null;
    const branchName = formData.get("branchName") as string | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided in request." }, { status: 400 });
    }
    if (!eventId) {
      return NextResponse.json({ error: "Event ID is required." }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    // Security Phase 4 validation (size, extension, mime, magic numbers)
    const validation = validateFileSecurity(buffer, file.name, file.type);
    if (!validation.isValid) {
      return NextResponse.json({ error: validation.error }, { status: 422 });
    }

    // Determine folder
    let targetFolder: TargetFolderType = "events";
    if (branchName) {
      const cleanBranch = branchName.toLowerCase().replace(/\s+/g, "-");
      if (cleanBranch.includes("shapur")) targetFolder = "branch-shapur-nagar";
      else if (cleanBranch.includes("subhash")) targetFolder = "branch-subhash-nagar";
      else if (cleanBranch.includes("bahadurpally")) targetFolder = "branch-bahadurpally";
    }

    // Phase 5: Automated image optimization and Cloudinary upload
    const uploadResult = await uploadBufferToCloudinary(buffer, targetFolder, "image");

    // Phase 7: Save in Neon PostgreSQL database
    const eventMedia = await prisma.eventMedia.create({
      data: {
        eventId,
        imageUrl: uploadResult.secure_url,
        publicId: uploadResult.public_id,
        caption: caption || file.name,
        uploadedById: auth.uid,
      },
    });

    // Phase 10: Trigger Socket.io real-time popup
    try {
      await fetch("http://localhost:3001/api/trigger-event", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "media-uploaded",
          payload: {
            id: eventMedia.id,
            eventId,
            type: "IMAGE",
            url: uploadResult.secure_url,
            publicId: uploadResult.public_id,
            uploadedBy: auth.name || "Event Manager",
            timestamp: new Date(),
          },
        }),
      });
    } catch {
      // Socket server optional failover
    }

    return NextResponse.json({
      success: true,
      media: eventMedia,
      cloudinary: {
        publicId: uploadResult.public_id,
        url: uploadResult.secure_url,
        width: uploadResult.width,
        height: uploadResult.height,
        format: uploadResult.format,
      },
    });
  } catch (err: any) {
    console.error("[API/UPLOAD/EVENT-IMAGE] Error:", err);
    return NextResponse.json({ error: err.message || "Upload failed." }, { status: 500 });
  }
}
