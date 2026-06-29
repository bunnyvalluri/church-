import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminOrDev } from "@/lib/authMiddleware";
import { validateFileSecurity } from "@/lib/uploadSecurity";
import { uploadBufferToCloudinary } from "@/lib/cloudinary";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const auth = await requireAdminOrDev(req);
  if (auth instanceof NextResponse) return auth;

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const projectId = formData.get("projectId") as string | null;
    const category = formData.get("category") as string | null;
    const title = formData.get("title") as string | null;
    const description = formData.get("description") as string | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided." }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    const validation = validateFileSecurity(buffer, file.name, file.type);
    if (!validation.isValid) {
      return NextResponse.json({ error: validation.error }, { status: 422 });
    }

    const isVideo = file.type.startsWith("video/");
    const uploadResult = await uploadBufferToCloudinary(buffer, "ngo", isVideo ? "video" : "image");

    const ngoMedia = await prisma.ngoMedia.create({
      data: {
        projectId: projectId || null,
        title: title || file.name,
        description: description || null,
        category: category || "GENERAL",
        type: isVideo ? "VIDEO_LOCAL" : "IMAGE",
        url: uploadResult.secure_url,
        publicId: uploadResult.public_id,
        thumbnailUrl: isVideo ? uploadResult.secure_url.replace(/\.[^/.]+$/, ".jpg") : null,
      },
    });

    return NextResponse.json({
      success: true,
      media: ngoMedia,
      cloudinary: {
        publicId: uploadResult.public_id,
        url: uploadResult.secure_url,
      },
    });
  } catch (err: any) {
    console.error("[API/UPLOAD/NGO-MEDIA] Error:", err);
    return NextResponse.json({ error: err.message || "NGO media upload failed." }, { status: 500 });
  }
}
