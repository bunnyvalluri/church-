import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// GET /api/branches
export async function GET() {
  try {
    let dbBranches = await prisma.branch.findMany();
    
    // Auto-seed if database is empty to ensure branches are never missing
    if (dbBranches.length === 0) {
      const defaultBranches = [
        { name: "Shapur Nagar" },
        { name: "Subhash Nagar" },
        { name: "Bahadurpally" }
      ];
      
      await prisma.$transaction(
        defaultBranches.map(b => 
          prisma.branch.upsert({
            where: { name: b.name },
            update: {},
            create: b
          })
        )
      );
      
      dbBranches = await prisma.branch.findMany();
    }
    
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
  try {
    const body = await req.json();
    const { name } = body;

    if (!name || name.trim().length === 0) {
      return NextResponse.json(
        { error: "Branch name is required." },
        { status: 400 }
      );
    }

    const trimmedName = name.trim();

    // Check if branch already exists
    const existing = await prisma.branch.findFirst({
      where: {
        name: {
          equals: trimmedName,
          mode: 'insensitive'
        }
      }
    });

    if (existing) {
      return NextResponse.json({ success: true, branch: existing }, { status: 200 });
    }

    const branch = await prisma.branch.create({
      data: { name: trimmedName },
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
