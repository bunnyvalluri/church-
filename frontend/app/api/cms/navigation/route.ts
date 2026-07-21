/**
 * app/api/cms/navigation/route.ts
 * CMS API for navigation items (footer links and nav links).
 * GET    — Public, grouped by placement
 * POST   — Create item (Admin+)
 * PUT    — Update/reorder items (Admin+)
 * DELETE — Delete item (Admin+)
 */
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/authMiddleware";
import {
  NavigationItemCreateSchema,
  NavigationItemUpdateSchema,
  NavigationItemBatchReorderSchema,
} from "@/lib/schemas/cms";
import { revalidateTag } from "next/cache";

export const dynamic = "force-dynamic";

// GET /api/cms/navigation?placement=FOOTER_ABOUT (or all)
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const placement = searchParams.get("placement");

  try {
    const rawItems = await (prisma as any).navigationItem.findMany({
      where: {
        isActive: true,
        ...(placement ? { placement } : {}),
      },
      orderBy: [{ placement: "asc" }, { displayOrder: "asc" }],
    });

    const items = rawItems.filter(
      (item: any) =>
        item.href !== "/blog" &&
        !item.href?.includes("/blog") &&
        item.label?.toLowerCase() !== "blog"
    );

    // Group by placement if no specific placement requested
    if (!placement) {
      const grouped = items.reduce((acc: Record<string, any[]>, item: any) => {
        if (!acc[item.placement]) acc[item.placement] = [];
        acc[item.placement].push(item);
        return acc;
      }, {});
      return NextResponse.json(
        { data: grouped },
        {
          headers: {
            "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
          },
        }
      );
    }

    return NextResponse.json(
      { data: items },
      {
        headers: {
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
        },
      }
    );
  } catch (err: any) {
    console.error("[API/CMS/NAVIGATION] GET error:", err);
    return NextResponse.json({ data: [] }, { status: 200 });
  }
}

// POST /api/cms/navigation — create a navigation item
export async function POST(req: Request) {
  const auth = await requireAdmin(req);
  if (auth instanceof NextResponse) return auth;

  try {
    const body = await req.json();
    const parsed = NavigationItemCreateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 422 }
      );
    }

    const item = await (prisma as any).navigationItem.create({ data: parsed.data });
    try { revalidateTag("cms-navigation"); } catch {}
    return NextResponse.json({ data: item, message: "Navigation item created." }, { status: 201 });
  } catch (err: any) {
    console.error("[API/CMS/NAVIGATION] POST error:", err);
    return NextResponse.json({ error: err.message || "Failed to create navigation item." }, { status: 500 });
  }
}

// PUT /api/cms/navigation — update one item OR batch reorder
export async function PUT(req: Request) {
  const auth = await requireAdmin(req);
  if (auth instanceof NextResponse) return auth;

  try {
    const body = await req.json();

    // Batch reorder
    if (Array.isArray(body.items)) {
      const parsed = NavigationItemBatchReorderSchema.safeParse(body);
      if (!parsed.success) {
        return NextResponse.json(
          { error: "Validation failed", details: parsed.error.flatten() },
          { status: 422 }
        );
      }
      await (prisma as any).$transaction(
        parsed.data.items.map(({ id, displayOrder }: any) =>
          (prisma as any).navigationItem.update({
            where: { id },
            data: { displayOrder },
          })
        )
      );
      try { revalidateTag("cms-navigation"); } catch {}
      return NextResponse.json({ message: `Reordered ${parsed.data.items.length} items.` });
    }

    // Single item update
    const parsed = NavigationItemUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 422 }
      );
    }

    const { id, ...data } = parsed.data;
    const item = await (prisma as any).navigationItem.update({
      where: { id },
      data,
    });

    try { revalidateTag("cms-navigation"); } catch {}
    return NextResponse.json({ data: item, message: "Navigation item updated." });
  } catch (err: any) {
    console.error("[API/CMS/NAVIGATION] PUT error:", err);
    return NextResponse.json({ error: err.message || "Failed to update navigation item." }, { status: 500 });
  }
}

// DELETE /api/cms/navigation?id=
export async function DELETE(req: Request) {
  const auth = await requireAdmin(req);
  if (auth instanceof NextResponse) return auth;

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "Navigation item ID is required." }, { status: 400 });
  }

  try {
    await (prisma as any).navigationItem.delete({ where: { id } });
    try { revalidateTag("cms-navigation"); } catch {}
    return NextResponse.json({ message: "Navigation item deleted." });
  } catch (err: any) {
    console.error("[API/CMS/NAVIGATION] DELETE error:", err);
    return NextResponse.json({ error: err.message || "Failed to delete navigation item." }, { status: 500 });
  }
}
