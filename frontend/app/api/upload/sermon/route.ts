import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireStaffOrDev } from "@/lib/authMiddleware";
import { validateFileSecurity } from "@/lib/uploadSecurity";
import { uploadBufferToCloudinary } from "@/lib/cloudinary";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const auth = await requireStaffOrDev(req);
  if (auth instanceof NextResponse) return auth;

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const sermonId = formData.get("sermonId") as string | null;
    const mediaType = (formData.get("mediaType") as string) || "thumbnail"; // "thumbnail" or "video"

    if (!file) {
      return NextResponse.json({ error: "No file provided." }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    const validation = validateFileSecurity(buffer, file.name, file.type);
    if (!validation.isValid) {
      return NextResponse.json({ error: validation.error }, { status: 422 });
    }

    const resourceType = mediaType === "video" ? "video" : "image";
    const uploadResult = await uploadBufferToCloudinary(buffer, "sermons", resourceType);

    // If sermonId provided, update database record
    let sermon = null;
    if (sermonId) {
      const updateData: any = {};
      if (mediaType === "video") {
        updateData.videoUrl = uploadResult.secure_url;
        updateData.videoPublicId = uploadResult.public_id;
      } else {
        updateData.thumbnail = uploadResult.secure_url;
        updateData.thumbnailPublicId = uploadResult.public_id;
      }

      sermon = await prisma.sermon.update({
        where: { id: sermonId },
        data: updateData,
      });
    }

    return NextResponse.json({
      success: true,
      sermon,
      media: {
        url: uploadResult.secure_url,
        publicId: uploadResult.public_id,
        mediaType,
      },
    });
  } catch (err: any) {
    console.error("[API/UPLOAD/SERMON] Error:", err);
    return NextResponse.json({ error: err.message || "Sermon upload failed." }, { status: 500 });
  }
}
