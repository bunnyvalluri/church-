import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { CURATED_GALLERY_ITEMS } from "@/lib/galleryData";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const cursor = searchParams.get("cursor");
    const limitParam = searchParams.get("limit");
    const category = searchParams.get("category");
    const branchId = searchParams.get("branch");
    const isNgo = searchParams.get("ngo") === "true";
    const searchQuery = searchParams.get("q")?.toLowerCase();

    const limit = limitParam
      ? Math.min(isNgo ? 1000 : 500, Math.max(1, parseInt(limitParam)))
      : 200;

    const where: any = {};
    if (category && category !== "ALL" && category !== "All Moments" && category !== "All") {
      where.category = { equals: category, mode: "insensitive" };
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
          description: true,
          category: true,
          createdAt: true,
        },
      });

      items = ngoItems.map((item) => ({
        id: item.id,
        title: item.title || "NGO Outreach Activity",
        description: item.description || "Community care & social outreach ministry by Kingdom of Christ Ministries.",
        url: item.url,
        imageUrl: item.url,
        thumbnailUrl: item.thumbnailUrl || item.url,
        category: item.category || "Outreach",
        type: "image",
        createdAt: item.createdAt,
        branchId: null,
        branchName: "NGO Ministries",
      }));
    } else {
      if (branchId && branchId !== "all") {
        where.branchId = branchId;
      }

      if (searchQuery) {
        where.OR = [
          { title: { contains: searchQuery, mode: "insensitive" } },
          { description: { contains: searchQuery, mode: "insensitive" } },
          { category: { contains: searchQuery, mode: "insensitive" } },
        ];
      }

      const dbItems = await prisma.gallery.findMany({
        take: limit + 1,
        ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
        where,
        orderBy: { createdAt: "desc" },
        include: {
          branch: {
            select: { name: true },
          },
        },
      });

      if (dbItems && dbItems.length > 0) {
        items = dbItems.map((item) => ({
          id: item.id,
          title: item.title,
          description: item.description || "",
          url: item.imageUrl,
          imageUrl: item.imageUrl,
          thumbnailUrl: item.thumbnailUrl || item.imageUrl,
          category: item.category,
          branchId: item.branchId,
          branchName: item.branch?.name || (item.branchId ? "Subhash Nagar" : "Main Church"),
          type: "image",
          createdAt: item.createdAt,
        }));
      } else {
        // Fallback to curated static data
        let fallback = CURATED_GALLERY_ITEMS;
        if (branchId && branchId !== "all") {
          fallback = fallback.filter((it) => it.branchId === branchId);
        }
        if (category && category !== "ALL" && category !== "All Moments" && category !== "All") {
          fallback = fallback.filter(
            (it) => it.category.toLowerCase() === category.toLowerCase()
          );
        }
        if (searchQuery) {
          fallback = fallback.filter(
            (it) =>
              it.title.toLowerCase().includes(searchQuery) ||
              it.description.toLowerCase().includes(searchQuery) ||
              it.category.toLowerCase().includes(searchQuery)
          );
        }
        items = fallback.slice(0, limit + 1);
      }
    }

    const hasMore = items.length > limit;
    const paginatedItems = hasMore ? items.slice(0, limit) : items;
    const nextCursor =
      hasMore && paginatedItems.length > 0
        ? paginatedItems[paginatedItems.length - 1].id
        : null;

    const formattedItems = paginatedItems.map((item) => {
      let thumb = item.thumbnailUrl || item.url || item.imageUrl;
      let full = item.url || item.imageUrl;

      if (thumb && thumb.includes("cloudinary.com")) {
        thumb = thumb.replace("/upload/", "/upload/w_600,c_scale,f_auto,q_auto/");
        full = full.replace("/upload/", "/upload/f_auto,q_auto/");
      }

      return {
        id: item.id,
        title: item.title,
        description: item.description,
        url: full,
        imageUrl: full,
        thumbnailUrl: thumb,
        category: item.category,
        branchId: item.branchId,
        branchName: item.branchName || "Subhash Nagar",
        eventName: item.eventName || "Family Blessing Gathering",
        eventDate: item.eventDate || "July 15, 2026",
        type: item.type || "image",
        videoId: item.videoId,
        tags: item.tags || [item.category],
        createdAt: item.createdAt,
      };
    });

    return NextResponse.json({
      success: true,
      galleryItems: formattedItems,
      images: formattedItems,
      total: formattedItems.length,
      nextCursor,
      hasMore,
    });
  } catch (err: any) {
    console.error("[API/GALLERY/GET] Error:", err);
    // Graceful offline fallback
    return NextResponse.json({
      success: true,
      galleryItems: CURATED_GALLERY_ITEMS,
      images: CURATED_GALLERY_ITEMS,
      total: CURATED_GALLERY_ITEMS.length,
      hasMore: false,
    });
  }
}
