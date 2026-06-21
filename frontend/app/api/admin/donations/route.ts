import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdminOrDev } from '@/lib/authMiddleware';

// Force dynamic server rendering
export const dynamic = 'force-dynamic';

// ─── GET: List all donations with filters + summary stats ─────────────────────
export async function GET(req: Request) {
  const auth = await requireAdminOrDev(req);
  if (auth instanceof NextResponse) return auth;

  try {
    const { searchParams } = new URL(req.url);
    const purpose    = searchParams.get('purpose');
    const status     = searchParams.get('status');
    const method     = searchParams.get('method');
    const dateFrom   = searchParams.get('from');
    const dateTo     = searchParams.get('to');
    const page       = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const pageSize   = Math.min(100, parseInt(searchParams.get('pageSize') || '50'));

    // Build Prisma where clause
    const where: any = {};
    if (purpose) where.purpose = purpose;
    if (status)  where.status  = status;
    if (method)  where.paymentMethod = method;
    if (dateFrom || dateTo) {
      where.createdAt = {};
      if (dateFrom) where.createdAt.gte = new Date(dateFrom);
      if (dateTo)   where.createdAt.lte = new Date(new Date(dateTo).setHours(23, 59, 59, 999));
    }

    // Parallel: paginated list + total count + aggregate stats
    const [donations, totalCount, stats] = await Promise.all([
      prisma.donation.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: {
          user: { select: { name: true, email: true } },
        },
      }),
      prisma.donation.count({ where }),
      prisma.donation.groupBy({
        by: ['status'],
        _sum: { amount: true },
        _count: { _all: true },
      }),
    ]);

    // Build summary totals
    const summary = {
      totalCollected: 0,
      pendingAmount: 0,
      completedCount: 0,
      pendingCount: 0,
      failedCount: 0,
      upiCount: 0,
      razorpayCount: 0,
    };
    for (const s of stats) {
      const amt = s._sum.amount ?? 0;
      const cnt = s._count._all;
      if (s.status === 'COMPLETED') { summary.totalCollected += amt; summary.completedCount += cnt; }
      if (s.status === 'PENDING')   { summary.pendingAmount  += amt; summary.pendingCount   += cnt; }
      if (s.status === 'FAILED')    { summary.failedCount    += cnt; }
    }

    // Method counts (no groupBy needed — derive from full stats)
    const methodStats = await prisma.donation.groupBy({
      by: ['paymentMethod'],
      _count: { _all: true },
    });
    for (const m of methodStats) {
      if (m.paymentMethod === 'UPI')      summary.upiCount      = m._count._all;
      if (m.paymentMethod === 'RAZORPAY') summary.razorpayCount = m._count._all;
    }

    return NextResponse.json({
      success: true,
      donations,
      pagination: { page, pageSize, totalCount, totalPages: Math.ceil(totalCount / pageSize) },
      summary,
    });
  } catch (err: any) {
    console.error('[ADMIN/DONATIONS/GET] Error:', err);
    return NextResponse.json({ error: err?.message || 'Database error' }, { status: 500 });
  }
}

// ─── POST: Manually log a cash/offline donation ───────────────────────────────
export async function POST(req: Request) {
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
        purpose,
        paymentMethod: paymentMethod || 'CASH',
        razorpayPaymentId: razorpayPaymentId || null,
        stripeId: stripeId || null,
        status: status || 'COMPLETED',
      },
    });

    return NextResponse.json({ success: true, donation });
  } catch (err: any) {
    console.error('[ADMIN/DONATIONS/POST] Error:', err);
    return NextResponse.json({ error: err?.message || 'Database error' }, { status: 500 });
  }
}

// ─── PATCH: Manually verify a UPI donation (approve pending UTR) ──────────────
export async function PATCH(req: Request) {
  const auth = await requireAdminOrDev(req);
  if (auth instanceof NextResponse) return auth;

  try {
    const body = await req.json();
    const { donationId, action, notes } = body; // action: 'APPROVE' | 'REJECT'

    if (!donationId || !action) {
      return NextResponse.json({ error: 'donationId and action are required' }, { status: 400 });
    }

    const newStatus = action === 'APPROVE' ? 'COMPLETED' : 'FAILED';

    const updated = await prisma.donation.update({
      where: { id: donationId },
      data: {
        status: newStatus,
        ...(action === 'APPROVE' && {
          razorpaySignature: `manual_verified_${Date.now()}`,
        }),
      },
    });

    console.info(`[ADMIN/DONATIONS/PATCH] ${action} donation ${donationId} → ${newStatus}`);

    // Notify on approval
    if (action === 'APPROVE') {
      try {
        const { createNotification } = await import('@/lib/notification');
        await createNotification({
          type: 'DONATION',
          title: 'UPI Donation Verified',
          content: `Admin verified UPI donation of ₹${updated.amount.toLocaleString()} from ${updated.donorName || 'member'}.`,
          link: 'donations',
        });
      } catch {}
    }

    return NextResponse.json({ success: true, donation: updated });
  } catch (err: any) {
    console.error('[ADMIN/DONATIONS/PATCH] Error:', err);
    return NextResponse.json({ error: err?.message || 'Database error' }, { status: 500 });
  }
}

// ─── DELETE: Remove a donation record ────────────────────────────────────────
export async function DELETE(req: Request) {
  const auth = await requireAdminOrDev(req);
  if (auth instanceof NextResponse) return auth;

  try {
    const { searchParams } = new URL(req.url);
    const donationId = searchParams.get('id');

    if (!donationId) {
      return NextResponse.json({ error: 'Donation ID is required' }, { status: 400 });
    }

    await prisma.donation.delete({ where: { id: donationId } });

    return NextResponse.json({ success: true, message: 'Donation deleted successfully' });
  } catch (err: any) {
    console.error('[ADMIN/DONATIONS/DELETE] Error:', err);
    return NextResponse.json({ error: err?.message || 'Database error' }, { status: 500 });
  }
}
