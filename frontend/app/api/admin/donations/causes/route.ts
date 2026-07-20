import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// GET: Fetch all donation causes/purposes
export async function GET() {
  try {
    const causes = await prisma.donationPurpose.findMany({
      orderBy: { sortOrder: 'asc' },
    });
    return NextResponse.json({ success: true, causes });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Failed to fetch causes' }, { status: 500 });
  }
}

// POST: Create a new donation cause
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { code, nameEn, nameTe, nameHi, descEn, icon, category, targetAmount, sortOrder, isActive } = body;

    if (!code || !nameEn) {
      return NextResponse.json({ error: 'Cause code and English name are required' }, { status: 400 });
    }

    const created = await prisma.donationPurpose.create({
      data: {
        code: code.toUpperCase().replace(/\s+/g, '_'),
        nameEn,
        nameTe: nameTe || nameEn,
        nameHi: nameHi || nameEn,
        descEn: descEn || '',
        icon: icon || 'Heart',
        category: category || 'GENERAL',
        targetAmount: targetAmount ? parseFloat(targetAmount) : null,
        sortOrder: sortOrder ? parseInt(sortOrder) : 0,
        isActive: isActive !== undefined ? Boolean(isActive) : true,
      },
    });

    return NextResponse.json({ success: true, cause: created });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Failed to create donation cause' }, { status: 500 });
  }
}

// PUT: Update an existing donation cause
export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { id, nameEn, nameTe, nameHi, descEn, icon, category, targetAmount, sortOrder, isActive, isArchived } = body;

    if (!id) {
      return NextResponse.json({ error: 'Cause ID is required' }, { status: 400 });
    }

    const updated = await prisma.donationPurpose.update({
      where: { id },
      data: {
        nameEn: nameEn || undefined,
        nameTe: nameTe || undefined,
        nameHi: nameHi || undefined,
        descEn: descEn || undefined,
        icon: icon || undefined,
        category: category || undefined,
        targetAmount: targetAmount !== undefined ? (targetAmount ? parseFloat(targetAmount) : null) : undefined,
        sortOrder: sortOrder !== undefined ? parseInt(sortOrder) : undefined,
        isActive: isActive !== undefined ? Boolean(isActive) : undefined,
        isArchived: isArchived !== undefined ? Boolean(isArchived) : undefined,
      },
    });

    return NextResponse.json({ success: true, cause: updated });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Failed to update donation cause' }, { status: 500 });
  }
}

// DELETE: Soft delete / archive or delete a donation cause
export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Cause ID is required' }, { status: 400 });
    }

    await prisma.donationPurpose.update({
      where: { id },
      data: { isArchived: true, isActive: false },
    });

    return NextResponse.json({ success: true, message: 'Donation cause archived successfully' });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Failed to archive donation cause' }, { status: 500 });
  }
}
