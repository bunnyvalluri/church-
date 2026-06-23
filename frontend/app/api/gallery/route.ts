import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// GET /api/gallery
// Public route to fetch all items in the Gallery table
export async function GET() {
  try {
    const items = await prisma.gallery.findMany({
      orderBy: { createdAt: "desc" },
    });

    const galleryItems = items.map((item) => {
      const ext = item.imageUrl.split(".").pop()?.toLowerCase() || "";
      const type = ["mp4", "webm"].includes(ext) ? "video" : "image";
      return {
        id: item.id,
        title: item.title,
        description: item.description || "Church Activity Media",
        url: item.imageUrl,
        category: item.category,
        type,
        createdAt: item.createdAt,
      };
    });

    return NextResponse.json({ success: true, galleryItems });
  } catch (err: any) {
    console.error("[API/GALLERY/GET] Error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to load gallery items." },
      { status: 500 }
    );
  }
}
