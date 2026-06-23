import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// GET /api/branch/[branchId]/events
// Fetches all published events for a specific branch
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

    const events = await prisma.event.findMany({
      where: {
        branchId,
        status: "PUBLISHED",
      },
      orderBy: { date: "desc" },
      include: {
        branch: { select: { id: true, name: true } },
        createdBy: { select: { id: true, name: true } },
        media: {
          orderBy: { uploadedAt: "asc" },
        },
        _count: { select: { registrations: true, media: true } },
      },
    });

    return NextResponse.json({ success: true, events });
  } catch (err: any) {
    console.error("[API/BRANCH/EVENTS/GET] Error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to load branch events." },
      { status: 500 }
    );
  }
}
