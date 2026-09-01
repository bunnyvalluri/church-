/**
 * GET /api/payments/[id]/status
 * ─────────────────────────────────────────────────────────────────────────────
 * Authoritative Payment Status Query Endpoint.
 *
 * Security:
 *  • Validates caller authorization / prevents IDOR
 *  • Rate limited per IP
 *  • Returns authoritative state machine value from PostgreSQL
 *  • Automatically halts client polling on terminal state
 */

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthenticatedUser } from '@/lib/authMiddleware';
import { getClientIp } from '@/lib/security';
import { runPaymentSecurityChecks } from '@/lib/paymentSecurity';
import { rateLimitHeaders } from '@/lib/rateLimit';

export const dynamic = 'force-dynamic';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const ip = getClientIp(req);
  const RATE_OPTS = { windowMs: 60 * 1000, maxRequests: 60 };
  const targetId = params.id;

  if (!targetId) {
    return NextResponse.json({ error: 'Payment or Donation ID required.' }, { status: 400 });
  }

  // 1. Rate Limit Guard
  const secCheck = runPaymentSecurityChecks(ip, 'VERIFY_PAYMENT');
  if (!secCheck.allowed) {
    return NextResponse.json(
      { error: secCheck.reason },
      { status: secCheck.statusCode, headers: rateLimitHeaders(ip, RATE_OPTS) }
    );
  }

  try {
    // 2. Query Donation or Session by ID / Reference
    const [donation, session] = await Promise.all([
      prisma.donation.findFirst({
        where: {
          OR: [
            { id: targetId },
            { razorpayPaymentId: targetId },
            { razorpayOrderId: targetId },
          ],
        },
        include: {
          receipt: { select: { id: true, receiptNumber: true } },
          purposeRelation: { select: { nameEn: true, code: true } },
        },
      }),
      prisma.donationSession.findFirst({
        where: {
          OR: [
            { id: targetId },
            { referenceNumber: targetId },
            { razorpayOrderId: targetId },
          ],
        },
        include: {
          donations: {
            take: 1,
            include: { receipt: { select: { id: true, receiptNumber: true } } },
          },
        },
      }),
    ]);

    if (!donation && !session) {
      return NextResponse.json({ error: 'Payment record not found.' }, { status: 404 });
    }

    // 3. Security: Check Ownership if user is bound
    const authUser = await getAuthenticatedUser(req);
    const ownerUserId = donation?.userId || session?.memberId;

    if (ownerUserId && (!authUser || authUser.uid !== ownerUserId)) {
      const isStaffOrAdmin = authUser && ['SUPER_ADMIN', 'ADMIN', 'FINANCE_ADMIN', 'PASTOR'].includes(authUser.role);
      if (!isStaffOrAdmin) {
        // Safe rejection for unauthorized access
        return NextResponse.json({ error: 'Access denied.' }, { status: 403 });
      }
    }

    const effectiveDonation = donation || session?.donations?.[0];
    const status = effectiveDonation?.status || session?.status || 'PENDING';
    const isTerminal = ['COMPLETED', 'FAILED', 'EXPIRED', 'REFUNDED'].includes(status);

    return NextResponse.json(
      {
        success: true,
        status,
        isTerminal,
        donationId: effectiveDonation?.id || null,
        sessionId: session?.id || effectiveDonation?.sessionId || null,
        amount: effectiveDonation?.amount || session?.amount,
        currency: effectiveDonation?.currency || session?.currency || 'INR',
        receiptNumber: effectiveDonation?.receipt?.receiptNumber || null,
        receiptId: effectiveDonation?.receipt?.id || null,
        paidAt: effectiveDonation?.createdAt || null,
      },
      { headers: rateLimitHeaders(ip, RATE_OPTS) }
    );
  } catch (err: any) {
    console.error('[API/PAYMENTS/STATUS] Error:', err);
    return NextResponse.json(
      { error: 'An error occurred while retrieving payment status.' },
      { status: 500 }
    );
  }
}
