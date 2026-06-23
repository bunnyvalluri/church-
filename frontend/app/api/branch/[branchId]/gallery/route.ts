import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

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

    // Retrieve media linked to approved events under this branch
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
    const galleryItems = eventMedia.map((m) => {
      const ext = m.imageUrl.split(".").pop()?.toLowerCase() || "";
      const type = ["mp4", "webm"].includes(ext) ? "video" : "image";
      return {
        id: m.id,
        title: m.event.title,
        description: m.caption || m.event.description || "Branch Activity Media",
        url: m.imageUrl,
        category: type === "video" ? "Outreach" : "Events",
        type,
        createdAt: m.uploadedAt,
      };
    });

    return NextResponse.json({ success: true, galleryItems });
  } catch (err: any) {
    console.error("[API/BRANCH/GALLERY/GET] Error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to load branch gallery." },
      { status: 500 }
    );
  }
}
