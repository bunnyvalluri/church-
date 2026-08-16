import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { CURATED_GALLERY_ITEMS } from "@/lib/galleryData";

export const dynamic = "force-dynamic";

// GET /api/branch/[branchId]/gallery
// Fetches all media (images & videos) published for a specific branch
export async function GET(
  req: Request,
  { params }: { params: { branchId: string } }
) {
  try {
    const { branchId } = params;

    if (!branchId) {
      return NextResponse.json(
        { error: "Branch ID is required." },
        { status: 400 }
      );
    }

    const { searchParams } = new URL(req.url);
    const sortParam = searchParams.get("sort") || "order-asc";

    // Retrieve direct gallery items for this branch
    const dbGallery = await prisma.gallery.findMany({
      where: { branchId },
      orderBy: { createdAt: sortParam === "desc" || sortParam === "newest" ? "desc" : "asc" },
    });

    // Also retrieve media linked to approved events under this branch
    const eventMedia = await prisma.eventMedia.findMany({
      where: {
        event: {
          branchId,
          status: "PUBLISHED",
        },
      },
      orderBy: { uploadedAt: "desc" },
      include: {
        event: {
          select: {
            title: true,
            description: true,
            date: true,
          },
        },
      },
    });

    // Format into standard Gallery structure
    const eventGalleryItems = eventMedia.map((m) => {
      const ext = m.imageUrl.split(".").pop()?.toLowerCase() || "";
      const type = ["mp4", "webm"].includes(ext) ? "video" : "image";
      return {
        id: m.id,
        title: m.event.title,
        description: m.caption || m.event.description || "Branch Activity Media",
        url: m.imageUrl,
        thumbnailUrl: m.imageUrl,
        category: type === "video" ? "Outreach" : "Events",
        type,
        branchId,
        createdAt: m.uploadedAt.toISOString(),
      };
    });

    const directGalleryItems = dbGallery.map((g) => ({
      id: g.id,
      title: g.title,
      description: g.description || "",
      url: g.imageUrl,
      thumbnailUrl: g.thumbnailUrl || g.imageUrl,
      category: g.category,
      type: "image" as const,
      branchId: g.branchId,
      createdAt: g.createdAt.toISOString(),
    }));

    let combined: any[] = [...directGalleryItems, ...eventGalleryItems];

    if (combined.length === 0) {
      combined = CURATED_GALLERY_ITEMS.filter((it) => it.branchId === branchId);
    }

    return NextResponse.json({
      success: true,
      galleryItems: combined,
      images: combined,
      total: combined.length,
    });
  } catch (err: any) {
    console.error("[API/BRANCH/GALLERY/GET] Error:", err);
    const fallback = CURATED_GALLERY_ITEMS.filter((it) => it.branchId === params.branchId);
    return NextResponse.json({
      success: true,
      galleryItems: fallback,
      images: fallback,
      total: fallback.length,
    });
  }
}
