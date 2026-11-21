import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const pastors = await (prisma as any).pastor.findMany({
      where: { isActive: true },
      orderBy: { displayOrder: "asc" },
    });

    return NextResponse.json(
      { success: true, data: pastors, pastors },
      {
        status: 200,
        headers: {
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
        },
      }
    );
  } catch (err: any) {
    console.error("[API/PASTOR/GET] Error:", err);
    return NextResponse.json(
      {
        success: false,
        data: [],
        pastors: [],
        error: err?.message || "Failed to fetch pastors",
      },
      {
        status: 200, // Return 200 with empty array so UI degrades gracefully without unhandled promise rejections
        headers: {
          "Cache-Control": "public, s-maxage=10, stale-while-revalidate=30",
        },
      }
    );
  }
}
