import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const sermonId = params.id;

    if (!sermonId) {
      return NextResponse.json({ error: "Sermon ID is required." }, { status: 400 });
    }

    const sermon = await prisma.sermon.update({
      where: { id: sermonId },
      data: {
        views: {
          increment: 1,
        },
      },
      select: {
        id: true,
        views: true,
      },
    });

    return NextResponse.json({ success: true, views: sermon.views });
  } catch (err: any) {
    console.error("[API/SERMON/VIEW] Error incrementing sermon views:", err);
    return NextResponse.json(
      { error: err.message || "Failed to increment sermon views." },
      { status: 500 }
    );
  }
}
