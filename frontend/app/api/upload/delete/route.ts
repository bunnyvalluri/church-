import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/authMiddleware";
import { deleteCloudinaryAsset } from "@/lib/cloudinary";

export const dynamic = "force-dynamic";

export async function DELETE(req: Request) {
  const auth = await requireAuth(req);
  if (auth instanceof NextResponse) return auth;

  try {
    const { searchParams } = new URL(req.url);
    const publicId = searchParams.get("publicId");
    const mediaType = (searchParams.get("mediaType") as "image" | "video") || "image";
    const targetModel = searchParams.get("targetModel"); // EVENT_MEDIA, NGO_MEDIA, SERMON, PROFILE

    if (!publicId) {
      return NextResponse.json({ error: "Missing publicId parameter." }, { status: 400 });
    }

    // 1. Delete from Cloudinary CDN storage
    await deleteCloudinaryAsset(publicId, mediaType);

    // 2. Delete / nullify matching database record
    if (targetModel === "EVENT_MEDIA") {
      await prisma.eventMedia.deleteMany({
        where: { publicId },
      });
    } else if (targetModel === "NGO_MEDIA") {
      await prisma.ngoMedia.deleteMany({
        where: { publicId },
      });
    } else if (targetModel === "SERMON") {
      await prisma.sermon.updateMany({
        where: {
          OR: [{ videoPublicId: publicId }, { thumbnailPublicId: publicId }],
        },
        data: {
          ...(mediaType === "video" ? { videoUrl: null, videoPublicId: null } : { thumbnail: null, thumbnailPublicId: null }),
        },
      });
    } else if (targetModel === "PROFILE") {
      await prisma.user.updateMany({
        where: { profilePublicId: publicId },
        data: { image: null, profilePublicId: null },
      });
    }

    return NextResponse.json({
      success: true,
      message: "Asset permanently deleted from Cloudinary and database.",
      publicId,
    });
  } catch (err: any) {
    console.error("[API/UPLOAD/DELETE] Error:", err);
    return NextResponse.json({ error: err.message || "Deletion failed." }, { status: 500 });
  }
}
