import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthenticatedUser } from '@/lib/authMiddleware';
import { writeAuditLog } from '@/lib/auditLogger';
import { completeDonationSession } from '@/lib/paymentService';
import { isRateLimited, rateLimitHeaders } from '@/lib/rateLimit';

export const dynamic = 'force-dynamic';

// In-memory idempotency store (use Redis in production for multi-instance)
const idempotencyCache = new Map<string, { status: number; body: any; ts: number }>();
const IDEMPOTENCY_TTL_MS = 5 * 60 * 1000; // 5 minutes

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

    // ── Idempotency: return cached response for duplicate requests ──────────
    const idempotencyKey = req.headers.get('x-idempotency-key') || '';
    if (idempotencyKey) {
      const cached = idempotencyCache.get(idempotencyKey);
      if (cached && Date.now() - cached.ts < IDEMPOTENCY_TTL_MS) {
        return NextResponse.json(cached.body, { status: cached.status });
      }
    }

    const session = await prisma.donationSession.findUnique({
      where: { id: sessionId },
      include: { purpose: true, donations: { select: { id: true }, take: 1 } },
    });

    if (!session) {
      return NextResponse.json({ error: 'Donation session not found.' }, { status: 404 });
    }

    // ── 1. Already COMPLETED — return success immediately (idempotent) ───────
    if (session.status === 'COMPLETED') {
      const donation = session.donations?.[0] || await prisma.donation.findFirst({
        where: { sessionId: session.id },
      });
      const body = {
        success: true,
        status: 'COMPLETED',
        message: 'Payment already verified.',
        donationId: donation?.id,
        alreadyProcessed: true,
      };
      if (idempotencyKey) idempotencyCache.set(idempotencyKey, { status: 200, body, ts: Date.now() });
      return NextResponse.json(body, { headers: rateLimitHeaders(ip, rateLimitOpts) });
    }

    // ── 2. Validate expiration ───────────────────────────────────────────────
    if (new Date() > session.expiresAt) {
      await prisma.donationSession.update({
        where: { id: sessionId },
        data: { status: 'EXPIRED' },
      });
      return NextResponse.json(
        { error: 'This payment session has expired. Please start a new session.', status: 'EXPIRED' },
        { status: 400 }
      );
    }

    // ── 3. Ownership check ───────────────────────────────────────────────────
    const authUser = await getAuthenticatedUser(req);
    if (session.memberId && (!authUser || authUser.uid !== session.memberId)) {
      return NextResponse.json({ error: 'Forbidden: You do not own this donation session.' }, { status: 403 });
    }

    // ── 4. Query payment gateway (simulated — replace with real gateway SDK) ─
    // In production: call Razorpay/Cashfree API with session.referenceNumber
    // to check if the UPI transfer has settled.
    await new Promise((resolve) => setTimeout(resolve, 1200)); // simulated gateway latency

    // Simulated response: treat as PENDING if session is still within 10s of creation
    const sessionAgeMs = Date.now() - new Date(session.createdAt).getTime();
    const isVeryFresh = sessionAgeMs < 10_000;

    if (isVeryFresh) {
      // Gateway returned: payment not yet settled — tell client to keep polling
      return NextResponse.json(
        {
          success: false,
          status: 'PENDING',
          message: 'Payment not yet settled. Please wait a moment and try again.',
        },
        { status: 202, headers: rateLimitHeaders(ip, rateLimitOpts) }
      );
    }

    // ── 5. Complete the donation session ────────────────────────────────────
    const randomSuffix = Math.floor(100000 + Math.random() * 900000);
    const mockUtr = `UPI${Date.now().toString().slice(-6)}${randomSuffix}`;

    const result = await completeDonationSession(
      sessionId,
      mockUtr,
      `upi_manual_verified_sig_${Date.now()}`,
      { source: 'MANUAL_VERIFICATION_FALLBACK', ip }
    );

    await writeAuditLog({
      userId: session.memberId,
      action: 'PAYMENT_VERIFIED_MANUAL',
      details: `Manual verification for session ${sessionId}. UTR: ${mockUtr}. Already processed: ${result.alreadyProcessed}`,
      ipAddress: ip,
    });

    const successBody = {
      success: true,
      status: 'COMPLETED',
      message: 'Payment verified successfully.',
      donationId: result.donation?.id,
      alreadyProcessed: result.alreadyProcessed,
    };

    if (idempotencyKey) idempotencyCache.set(idempotencyKey, { status: 200, body: successBody, ts: Date.now() });

    return NextResponse.json(successBody, { headers: rateLimitHeaders(ip, rateLimitOpts) });
  } catch (err: any) {
    console.error('[API/PAYMENTS/VERIFY] Error:', err);
    return NextResponse.json(
      { error: err.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
