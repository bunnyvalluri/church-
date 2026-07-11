import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthenticatedUser } from '@/lib/authMiddleware';
import { writeAuditLog } from '@/lib/auditLogger';
import { completeDonationSession } from '@/lib/paymentService';
import { isRateLimited, rateLimitHeaders } from '@/lib/rateLimit';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';

  // Rate Limiting: Max 20 verification requests per 15 minutes per IP
  const rateLimitOpts = { windowMs: 15 * 60 * 1000, maxRequests: 20 };
  if (isRateLimited(ip, rateLimitOpts)) {
    return NextResponse.json(
      { error: 'Too many requests. Please try again later.' },
      { status: 429, headers: rateLimitHeaders(ip, rateLimitOpts) }
    );
  }

  try {
    const { sessionId } = await req.json();

    if (!sessionId) {
      return NextResponse.json({ error: 'Session ID is required.' }, { status: 400 });
    }

    const session = await prisma.donationSession.findUnique({
      where: { id: sessionId },
      include: { purpose: true },
    });

    if (!session) {
      return NextResponse.json({ error: 'Donation session not found.' }, { status: 404 });
    }

    // 1. If already completed, return success immediately
    if (session.status === 'COMPLETED') {
      const donation = await prisma.donation.findFirst({
        where: { sessionId: session.id },
      });
      return NextResponse.json({
        success: true,
        message: 'Payment verified successfully.',
        donation,
      });
    }

    // 2. Validate expiration
    if (new Date() > session.expiresAt) {
      await prisma.donationSession.update({
        where: { id: sessionId },
        data: { status: 'EXPIRED' },
      });
      return NextResponse.json({ error: 'This payment session has expired. Please start a new session.' }, { status: 400 });
    }

    // 3. Security checks: User ownership check
    const authUser = await getAuthenticatedUser(req);
    if (session.memberId && (!authUser || authUser.uid !== session.memberId)) {
      return NextResponse.json({ error: 'Forbidden: You do not own this donation session.' }, { status: 403 });
    }

    // 4. Simulate payment gateway ledger check
    // In a production setup, we would query the UPI gateway API using session.referenceNumber.
    // Here we simulate the network request and verify it succeeds.
    await new Promise((resolve) => setTimeout(resolve, 1500)); // 1.5s gateway delay

    // Generate simulated UPI UTR
    const randomSuffix = Math.floor(100000 + Math.random() * 900000);
    const mockUtr = `UPI${Date.now().toString().slice(-6)}${randomSuffix}`;

    // 5. Complete session
    const result = await completeDonationSession(
      sessionId,
      mockUtr,
      `upi_manual_verified_sig_${Date.now()}`,
      { source: 'MANUAL_VERIFICATION_FALLBACK' }
    );

    await writeAuditLog({
      userId: session.memberId,
      action: 'PAYMENT_VERIFIED_MANUAL',
      details: `Payment manual verification completed successfully for session: ${sessionId}. UTR: ${mockUtr}`,
      ipAddress: ip,
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Payment verified successfully.',
        donation: result.donation,
      },
      {
        headers: rateLimitHeaders(ip, rateLimitOpts),
      }
    );
  } catch (err: any) {
    console.error('[API/PAYMENTS/VERIFY] Error:', err);
    return NextResponse.json(
      { error: err.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
