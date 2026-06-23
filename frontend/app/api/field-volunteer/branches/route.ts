import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const dbBranches = await prisma.branch.findMany({
      select: { id: true, name: true },
    });

    // Sort customly: Shapur Nagar, Subhash Nagar, Bahadurpally
    const getIndex = (name: string) => {
      const norm = name.toLowerCase();
      if (norm.includes("shapur")) return 0;
      if (norm.includes("subhash")) return 1;
      if (norm.includes("bahadur")) return 2;
      return 3;
    };

    const branches = dbBranches.sort((a, b) => getIndex(a.name) - getIndex(b.name));

    return NextResponse.json({ success: true, branches });
  } catch (err: any) {
    console.error("[API/BRANCHES] Error fetching branches:", err);
    return NextResponse.json(
      { error: err.message || "Failed to load branches." },
      { status: 500 }
    );
  }
}
