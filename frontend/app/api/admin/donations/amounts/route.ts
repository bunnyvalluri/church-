import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// GET: Fetch all donation preset amounts
export async function GET() {
  try {
    const amounts = await prisma.donationAmount.findMany({
      orderBy: { displayOrder: 'asc' },
    });
    return NextResponse.json({ success: true, amounts });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Failed to fetch amounts' }, { status: 500 });
  }
}

// POST: Create a new preset amount
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { amount, label, currency, displayOrder, isActive, isDefault, campaignId } = body;

    if (!amount || isNaN(amount) || amount <= 0) {
      return NextResponse.json({ error: 'Valid positive amount is required' }, { status: 400 });
    }

    // If marked default, unset previous default
    if (isDefault) {
      await prisma.donationAmount.updateMany({
        where: { isDefault: true },
        data: { isDefault: false },
      });
    }

    const created = await prisma.donationAmount.create({
      data: {
        amount: parseFloat(amount),
        currency: currency || 'INR',
        label: label || `₹${amount}`,
        displayOrder: displayOrder ? parseInt(displayOrder) : 0,
        isActive: isActive !== undefined ? Boolean(isActive) : true,
        isDefault: Boolean(isDefault),
        campaignId: campaignId || null,
      },
    });

    return NextResponse.json({ success: true, amount: created });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Failed to create donation amount' }, { status: 500 });
  }
}

// PUT: Update an existing preset amount
export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { id, amount, label, displayOrder, isActive, isDefault } = body;

    if (!id) {
      return NextResponse.json({ error: 'Amount ID is required' }, { status: 400 });
    }

    if (isDefault) {
      await prisma.donationAmount.updateMany({
        where: { isDefault: true, id: { not: id } },
        data: { isDefault: false },
      });
    }

    const updated = await prisma.donationAmount.update({
      where: { id },
      data: {
        amount: amount !== undefined ? parseFloat(amount) : undefined,
        label: label !== undefined ? label : undefined,
        displayOrder: displayOrder !== undefined ? parseInt(displayOrder) : undefined,
        isActive: isActive !== undefined ? Boolean(isActive) : undefined,
        isDefault: isDefault !== undefined ? Boolean(isDefault) : undefined,
      },
    });

    return NextResponse.json({ success: true, amount: updated });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Failed to update donation amount' }, { status: 500 });
  }
}

// DELETE: Delete a preset amount
export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Amount ID is required' }, { status: 400 });
    }

    await prisma.donationAmount.delete({ where: { id } });
    return NextResponse.json({ success: true, message: 'Preset amount deleted successfully' });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Failed to delete donation amount' }, { status: 500 });
  }
}
