/**
 * GET /api/payments/webhook/history
 * ─────────────────────────────────────────────────────────────────────────────
 * Returns paginated webhook event history for Admin CMS.
 * Supports: ?limit=20&status=FAILED&page=0
 *
 * Security: ADMIN / SUPER_ADMIN only.
 */

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/authMiddleware';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const authResult = await requireAdmin(req);
    if (authResult instanceof NextResponse) return authResult;

    const { searchParams } = new URL(req.url);
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100);
    const page = Math.max(0, parseInt(searchParams.get('page') || '0'));
    const status = searchParams.get('status') || undefined;

    const where = status ? { status } : {};

    const [events, total] = await Promise.all([
      prisma.paymentWebhook.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: page * limit,
        take: limit,
        select: {
          id: true,
          event: true,
          status: true,
          razorpayPaymentId: true,
          razorpayOrderId: true,
          amount: true,
          amountMismatch: true,
          signatureValid: true,
          createdAt: true,
          processedAt: true,
          errorMessage: true,
        },
      }),
      prisma.paymentWebhook.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      events,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });

  } catch (err: any) {
    console.error('[WEBHOOK_HISTORY]', err?.message);
    return NextResponse.json({ error: 'Failed to load webhook history' }, { status: 500 });
  }
}
