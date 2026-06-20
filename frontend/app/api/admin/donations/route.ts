import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdminOrDev } from '@/lib/authMiddleware';

// Force dynamic server rendering
export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  // ── Auth Guard ─────────────────────────────────────────────────────────────
  const auth = await requireAdminOrDev(req);
  if (auth instanceof NextResponse) return auth;

  try {
    const donations = await prisma.donation.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({ success: true, donations });
  } catch (err: any) {
    console.error('[ADMIN/DONATIONS/GET] Error:', err);
    return NextResponse.json(
      { error: err?.message || 'Database error occurred' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  // ── Auth Guard ─────────────────────────────────────────────────────────────
  const auth = await requireAdminOrDev(req);
  if (auth instanceof NextResponse) return auth;

  try {
    const body = await req.json();
    const { donorName, donorEmail, amount, purpose, paymentMethod, razorpayPaymentId, stripeId, status } = body;

    if (amount === undefined || amount === null || !purpose) {
      return NextResponse.json({ error: 'Amount and purpose are required' }, { status: 400 });
    }

    const donation = await prisma.donation.create({
      data: {
        donorName: donorName || 'Anonymous Giver',
        donorEmail: donorEmail || null,
        amount: parseFloat(amount),
        purpose: purpose,
        paymentMethod: paymentMethod || 'CASH',
        razorpayPaymentId: razorpayPaymentId || null,
        stripeId: stripeId || null,
        status: status || 'COMPLETED',
      },
    });

    return NextResponse.json({ success: true, donation });
  } catch (err: any) {
    console.error('[ADMIN/DONATIONS/POST] Error:', err);
    return NextResponse.json(
      { error: err?.message || 'Database error occurred while logging donation' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  // ── Auth Guard ─────────────────────────────────────────────────────────────
  const auth = await requireAdminOrDev(req);
  if (auth instanceof NextResponse) return auth;

  try {
    const { searchParams } = new URL(req.url);
    const donationId = searchParams.get('id');

    if (!donationId) {
      return NextResponse.json({ error: 'Donation ID is required' }, { status: 400 });
    }

    await prisma.donation.delete({
      where: { id: donationId },
    });

    return NextResponse.json({ success: true, message: 'Donation deleted successfully' });
  } catch (err: any) {
    console.error('[ADMIN/DONATIONS/DELETE] Error:', err);
    return NextResponse.json(
      { error: err?.message || 'Database error occurred while deleting donation' },
      { status: 500 }
    );
  }
}


