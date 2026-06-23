import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminOrDev } from "@/lib/authMiddleware";

export const dynamic = "force-dynamic";

// GET /api/branches
export async function GET() {
  try {
    const dbBranches = await prisma.branch.findMany();
    
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
    console.error("[API/BRANCHES/GET] Error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to load branches." },
      { status: 500 }
    );
  }
}

// POST /api/branches
export async function POST(req: Request) {
  const auth = await requireAdminOrDev(req);
  if (auth instanceof NextResponse) return auth;

  try {
    const body = await req.json();
    const { name } = body;

    if (!name || name.trim().length === 0) {
      return NextResponse.json(
        { error: "Branch name is required." },
        { status: 400 }
      );
    }

    const branch = await prisma.branch.create({
      data: { name: name.trim() },
    });

    return NextResponse.json({ success: true, branch }, { status: 201 });
  } catch (err: any) {
    console.error("[API/BRANCHES/POST] Error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to create branch." },
      { status: 500 }
    );
  }
}
