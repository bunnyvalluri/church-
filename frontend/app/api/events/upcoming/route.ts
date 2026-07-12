import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = Math.min(parseInt(searchParams.get("limit") || "6"), 50);

    const now = new Date();

    const events = await prisma.event.findMany({
      where: {
        isDeleted: false,
        status: "PUBLISHED",
        date: { gte: now }, // Event date is in the future
      },
      orderBy: {
        date: "asc", // Show soonest events first
      },
      take: limit,
      include: {
        branch: { select: { id: true, name: true } },
        eventImages: true,
        _count: { select: { registrations: true } },
      },
    });

    return NextResponse.json({ success: true, events });
  } catch (err: any) {
    console.error("[API/EVENTS/UPCOMING/GET] Error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to load upcoming events." },
      { status: 500 }
    );
  }
}
