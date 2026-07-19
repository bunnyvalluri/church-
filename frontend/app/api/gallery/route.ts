import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const cursor = searchParams.get("cursor");
    const limitParam = searchParams.get("limit");
    const category = searchParams.get("category");
    const branchId = searchParams.get("branch");
    const isNgo = searchParams.get("ngo") === "true";

    const limit = limitParam ? Math.min(100, Math.max(1, parseInt(limitParam))) : 20;

    const where: any = {};
    if (category && category !== "ALL") {
      where.category = category;
    }

    let items: any[] = [];

    if (isNgo) {
      where.type = "IMAGE";

      const ngoItems = await prisma.ngoMedia.findMany({
        take: limit + 1,
        ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
        where,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          url: true,
          thumbnailUrl: true,
          title: true,
          category: true,
          createdAt: true,
        },
      });

      items = ngoItems.map(item => ({
        id: item.id,
        imageUrl: item.url,
        thumbnailUrl: item.thumbnailUrl,
        title: item.title,
        category: item.category,
        createdAt: item.createdAt,
        branchId: null,
      }));
    } else {
      if (branchId) {
        where.branchId = branchId;
      }

      items = await prisma.gallery.findMany({
        take: limit + 1,
        ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
        where,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          imageUrl: true,
          thumbnailUrl: true,
          title: true,
          category: true,
          createdAt: true,
          branchId: true,
        },
      });
    }

    const hasMore = items.length > limit;
    const paginatedItems = hasMore ? items.slice(0, limit) : items;
    const nextCursor = hasMore && paginatedItems.length > 0 ? paginatedItems[paginatedItems.length - 1].id : null;

    const images = paginatedItems.map((item) => {
      let thumb = item.thumbnailUrl || item.imageUrl;
      let full = item.imageUrl;

      if (thumb.includes("cloudinary.com")) {
        thumb = thumb.replace("/upload/", "/upload/w_400,c_scale,f_auto,q_auto/");
        full = full.replace("/upload/", "/upload/f_auto,q_auto/");
      }

      return {
        id: item.id,
        imageUrl: full,
        thumbnailUrl: thumb,
        title: item.title,
        category: item.category,
        createdAt: item.createdAt,
        branchId: item.branchId,
      };
    });

    return NextResponse.json({
      success: true,
      images,
      nextCursor,
      hasMore,
    });
  } catch (err: any) {
    console.error("[API/GALLERY/GET] Error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to load gallery items." },
      { status: 500 }
    );
  }
}
