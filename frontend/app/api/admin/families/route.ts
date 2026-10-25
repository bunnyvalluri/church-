import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export interface FamilyRecord {
  id: string;
  familyName: string;
  headOfHouseholdId: string;
  members: string[]; // User IDs
  contactPhone: string;
  address: string;
  anniversaryDate?: string | null;
  branchName?: string | null;
  notes?: string | null;
  createdAt: string | Date;
}

// GET: Fetch all families permanently from Postgres DB
export async function GET(req: Request) {
  try {
    const families = await prisma.family.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json({ success: true, families });
  } catch (err: any) {
    console.error('[ADMIN/FAMILIES/GET] Error:', err);
    return NextResponse.json({ error: err?.message || 'Server error occurred' }, { status: 500 });
  }
}

// POST: Create a new family permanently in Postgres DB
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { familyName, headOfHouseholdId, contactPhone, address, members, anniversaryDate, branchName, notes } = body;

    if (!familyName) {
      return NextResponse.json({ error: 'Family name is required' }, { status: 400 });
    }

    const newHeadId = headOfHouseholdId || "user_super_admin_001";
    const initialMembers = Array.isArray(members) && members.length > 0 
      ? Array.from(new Set([newHeadId, ...members])) 
      : [newHeadId];

    const created = await prisma.family.create({
      data: {
        familyName,
        headOfHouseholdId: newHeadId,
        members: initialMembers,
        contactPhone: contactPhone || '+91 96409 43777',
        address: address || 'Jeedimetla, Hyderabad',
        anniversaryDate: anniversaryDate || null,
        branchName: branchName || 'Shapur Nagar',
        notes: notes || null,
      },
    });

    return NextResponse.json({ success: true, family: created });
  } catch (err: any) {
    console.error('[ADMIN/FAMILIES/POST] Error:', err);
    return NextResponse.json({ error: err?.message || 'Server error occurred' }, { status: 500 });
  }
}

// PATCH: Update family details or roster permanently in Postgres DB
export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { id, familyName, headOfHouseholdId, contactPhone, address, members, anniversaryDate, branchName, notes } = body;

    if (!id) {
      return NextResponse.json({ error: 'Family ID is required' }, { status: 400 });
    }

    const updated = await prisma.family.update({
      where: { id },
      data: {
        ...(familyName && { familyName }),
        ...(headOfHouseholdId && { headOfHouseholdId }),
        ...(contactPhone !== undefined && { contactPhone }),
        ...(address !== undefined && { address }),
        ...(members !== undefined && { members }),
        ...(anniversaryDate !== undefined && { anniversaryDate }),
        ...(branchName !== undefined && { branchName }),
        ...(notes !== undefined && { notes }),
      },
    });

    return NextResponse.json({ success: true, family: updated });
  } catch (err: any) {
    console.error('[ADMIN/FAMILIES/PATCH] Error:', err);
    return NextResponse.json({ error: err?.message || 'Server error occurred' }, { status: 500 });
  }
}

// DELETE: Permanently delete a family from Postgres DB
export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Family ID is required' }, { status: 400 });
    }

    try {
      await prisma.family.delete({ where: { id } });
    } catch (err: any) {
      if (err?.code !== 'P2025') {
        throw err;
      }
    }

    const remaining = await prisma.family.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ success: true, message: 'Family permanently deleted', families: remaining });
  } catch (err: any) {
    console.error('[ADMIN/FAMILIES/DELETE] Error:', err);
    return NextResponse.json({ error: err?.message || 'Server error occurred' }, { status: 500 });
  }
}
