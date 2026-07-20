/**
 * app/api/cms/statistics/route.ts
 * CMS API for Site Statistics.
 * GET  — Public, ISR-cached (60s)
 * POST — Create new stat (Admin+)
 * PUT  — Batch update stats (Admin+)
 */
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/authMiddleware";
import {
  SiteStatisticCreateSchema,
  SiteStatisticBatchUpdateSchema,
} from "@/lib/schemas/cms";
import { revalidateTag } from "next/cache";

export const dynamic = "force-dynamic";

// GET /api/cms/statistics — fetch active statistics ordered by displayOrder
export async function GET() {
  try {
    const statistics = await (prisma as any).siteStatistic.findMany({
      where: { isActive: true },
      orderBy: { displayOrder: "asc" },
    });

    return NextResponse.json(
      { data: statistics },
      {
        status: 200,
        headers: {
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
        },
      }
    );
  } catch (err: any) {
    console.error("[API/CMS/STATISTICS] GET error:", err);
    return NextResponse.json({ data: [] }, { status: 200 });
  }
}

// POST /api/cms/statistics — create a new statistic
export async function POST(req: Request) {
  const auth = await requireAdmin(req);
  if (auth instanceof NextResponse) return auth;

  try {
    const body = await req.json();
    const parsed = SiteStatisticCreateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 422 }
      );
    }

    const stat = await (prisma as any).siteStatistic.create({
      data: { ...parsed.data, updatedById: auth.uid },
    });

    try { revalidateTag("cms-statistics"); } catch {}

    return NextResponse.json({ data: stat, message: "Statistic created." }, { status: 201 });
  } catch (err: any) {
    if (err.code === "P2002") {
      return NextResponse.json({ error: "A statistic with that key already exists." }, { status: 409 });
    }
    console.error("[API/CMS/STATISTICS] POST error:", err);
    return NextResponse.json({ error: err.message || "Failed to create statistic." }, { status: 500 });
  }
}

// PUT /api/cms/statistics — batch update statistics
export async function PUT(req: Request) {
  const auth = await requireAdmin(req);
  if (auth instanceof NextResponse) return auth;

  try {
    const body = await req.json();
    const parsed = SiteStatisticBatchUpdateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 422 }
      );
    }

    // Batch update in a transaction
    const results = await (prisma as any).$transaction(
      parsed.data.statistics.map(({ id, ...data }: any) =>
        (prisma as any).siteStatistic.update({
          where: { id },
          data: { ...data, updatedById: auth.uid },
        })
      )
    );

    try { revalidateTag("cms-statistics"); } catch {}

    return NextResponse.json({
      data: results,
      message: `Updated ${results.length} statistics.`,
    });
  } catch (err: any) {
    console.error("[API/CMS/STATISTICS] PUT error:", err);
    return NextResponse.json({ error: err.message || "Failed to update statistics." }, { status: 500 });
  }
}

// DELETE /api/cms/statistics?id= — delete a statistic
export async function DELETE(req: Request) {
  const auth = await requireAdmin(req);
  if (auth instanceof NextResponse) return auth;

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "Statistic ID is required." }, { status: 400 });
  }

  try {
    await (prisma as any).siteStatistic.delete({ where: { id } });
    try { revalidateTag("cms-statistics"); } catch {}
    return NextResponse.json({ message: "Statistic deleted." });
  } catch (err: any) {
    console.error("[API/CMS/STATISTICS] DELETE error:", err);
    return NextResponse.json({ error: err.message || "Failed to delete statistic." }, { status: 500 });
  }
}
