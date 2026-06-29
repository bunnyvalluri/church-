import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// GET /api/events/latest
// Public endpoint - fetches the 6 latest published events sorted by createdAt desc
export async function GET(req: Request) {
  try {
    const events = await prisma.event.findMany({
      where: {
        status: "PUBLISHED",
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 6,
      include: {
        branch: {
          select: {
            id: true,
            name: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return NextResponse.json({ success: true, events });
  } catch (error: any) {
    console.error("[API/EVENTS/LATEST/GET] Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to load latest events." },
      { status: 500 }
    );
  }
}
