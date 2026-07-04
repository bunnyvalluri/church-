import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdminOrDev } from '@/lib/authMiddleware';

export const dynamic = 'force-dynamic';

// GET: Fetch all families
export async function GET(req: Request) {
  const auth = await requireAdminOrDev(req);
  if (auth instanceof NextResponse) return auth;

  try {
    const families = await prisma.family.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json({ success: true, families });
  } catch (err: any) {
    console.error('[ADMIN/FAMILIES/GET] Error:', err);
    return NextResponse.json({ error: err?.message || 'Database error occurred' }, { status: 500 });
  }
}

// POST: Create a new family
export async function POST(req: Request) {
  const auth = await requireAdminOrDev(req);
  if (auth instanceof NextResponse) return auth;

  try {
    const body = await req.json();
    const { familyName, headOfHouseholdId, contactPhone, address, members } = body;

    if (!familyName || !headOfHouseholdId) {
      return NextResponse.json({ error: 'familyName and headOfHouseholdId are required' }, { status: 400 });
    }

    const family = await prisma.family.create({
      data: {
        familyName,
        headOfHouseholdId,
        contactPhone: contactPhone || '',
        address: address || '',
        members: members || [headOfHouseholdId],
      },
    });

    return NextResponse.json({ success: true, family });
  } catch (err: any) {
    console.error('[ADMIN/FAMILIES/POST] Error:', err);
    return NextResponse.json({ error: err?.message || 'Database error occurred' }, { status: 500 });
  }
}

// PATCH: Update family members or info
export async function PATCH(req: Request) {
  const auth = await requireAdminOrDev(req);
  if (auth instanceof NextResponse) return auth;

  try {
    const body = await req.json();
    const { id, familyName, headOfHouseholdId, contactPhone, address, members } = body;

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
      },
    });

    return NextResponse.json({ success: true, family: updated });
  } catch (err: any) {
    console.error('[ADMIN/FAMILIES/PATCH] Error:', err);
    return NextResponse.json({ error: err?.message || 'Database error occurred' }, { status: 500 });
  }
}

// DELETE: Delete a family
export async function DELETE(req: Request) {
  const auth = await requireAdminOrDev(req);
  if (auth instanceof NextResponse) return auth;

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Family ID is required' }, { status: 400 });
    }

    await prisma.family.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: 'Family deleted successfully' });
  } catch (err: any) {
    console.error('[ADMIN/FAMILIES/DELETE] Error:', err);
    return NextResponse.json({ error: err?.message || 'Database error occurred' }, { status: 500 });
  }
}
