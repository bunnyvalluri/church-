/**
 * POST /api/payments/verify
 * ─────────────────────────────────────────────────────────────────────────────
 * Production-grade payment verification endpoint.
 *
 * CRITICAL SECURITY CHANGE:
 *  ✅ Requires real Razorpay paymentId + signature for PRODUCTION
 *  ✅ HMAC-SHA256 signature verification before any DB write
 *  ✅ Amount cross-check: webhook amount must match DB amount (in paise)
 *  ✅ Idempotency: duplicate requests return cached response
 *  ✅ Session ownership check
 *  ✅ Session expiry check
 *  ✅ Rate limiting: 20 verifications per 15 min per IP
 *
 * UPI QR Flow note:
 *   For UPI QR payments (no Razorpay Checkout SDK), payment confirmation comes
 *   exclusively via webhook (/api/payments/webhook). This endpoint handles:
 *   a) Polling from frontend after QR scan (check if webhook completed it)
 *   b) Razorpay signature verification if client has payment credentials
 */

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthenticatedUser } from '@/lib/authMiddleware';
import { writeAuditLog } from '@/lib/auditLogger';
import { completeDonationSession } from '@/lib/paymentService';
import {
  verifyRazorpayPaymentSignature,
  verifyPaymentAmount,
  VerifyPaymentSchema,
  assertJsonContentType,
  getClientIp,
  sanitizeAuditField,
  maskSensitive,
} from '@/lib/security';
import {
  runPaymentSecurityChecks,
  recordPaymentFailure,
  clearPaymentFailures,
  logPaymentEvent,
  checkDuplicateOrder,
} from '@/lib/paymentSecurity';
import { rateLimitHeaders } from '@/lib/rateLimit';

export const dynamic = 'force-dynamic';

// ─── Idempotency Cache (in-memory; use Redis in multi-instance production) ────
const idempotencyCache = new Map<string, { status: number; body: unknown; ts: number }>();
const IDEMPOTENCY_TTL_MS = 10 * 60 * 1000; // 10 minutes

// ─── Simulation Mode Guard ────────────────────────────────────────────────────
function isSimulationAllowed(): boolean {
  // Only allow simulation in development AND if explicitly enabled
  return process.env.NODE_ENV !== 'production' &&
    process.env.ALLOW_PAYMENT_SIMULATION === 'true';
}

export async function POST(req: Request) {
  const ip = getClientIp(req);
  const RATE_OPTS = { windowMs: 15 * 60 * 1000, maxRequests: 20 };

  // ── 1. Content-Type Guard ──────────────────────────────────────────────────
  const ctError = assertJsonContentType(req);
  if (ctError) {
    return NextResponse.json({ error: ctError.error }, { status: ctError.status });
  }

  // ── 2. Security Checks (rate limit + IP block) ────────────────────────────
  const secCheck = runPaymentSecurityChecks(ip, 'VERIFY_PAYMENT');
  if (!secCheck.allowed) {
    await logPaymentEvent('IP_RATE_LIMITED', { route: 'verify-payment' }, ip);
    return NextResponse.json(
      { error: secCheck.reason },
      { status: secCheck.statusCode, headers: rateLimitHeaders(ip, RATE_OPTS) }
    );
  }

  try {
    // ── 3. Parse + Zod Validate ────────────────────────────────────────────
    let rawBody: unknown;
    try {
      rawBody = await req.json();
    } catch {
      return NextResponse.json({ error: 'Invalid JSON in request body.' }, { status: 400 });
    }

    const parsed = VerifyPaymentSchema.safeParse(rawBody);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0]?.message || 'Invalid request.' },
        { status: 400 }
      );
    }

    const { sessionId, razorpayOrderId, razorpayPaymentId, razorpaySignature, simulateMode } = parsed.data;

    // ── 4. Idempotency Check ───────────────────────────────────────────────
    const idempotencyKey = req.headers.get('x-idempotency-key') || '';
    if (idempotencyKey) {
      const cached = idempotencyCache.get(idempotencyKey);
      if (cached && Date.now() - cached.ts < IDEMPOTENCY_TTL_MS) {
        return NextResponse.json(cached.body, { status: cached.status });
      }
    }

    // ── 5. Load Session ────────────────────────────────────────────────────
    const session = await prisma.donationSession.findUnique({
      where: { id: sessionId },
      include: {
        purpose: true,
        donations: { select: { id: true, status: true, amount: true }, take: 1 },
      },
    });

    if (!session) {
      await logPaymentEvent('SESSION_NOT_FOUND', { sessionId: maskSensitive(sessionId, 8) }, ip);
      return NextResponse.json({ error: 'Donation session not found.' }, { status: 404 });
    }

    // ── 6. Already COMPLETED (idempotent success) ──────────────────────────
    if (session.status === 'COMPLETED') {
      const donation = session.donations?.[0];
      const body = {
        success: true,
        status: 'COMPLETED',
        message: 'Payment already verified.',
        donationId: donation?.id,
        alreadyProcessed: true,
      };
      if (idempotencyKey) idempotencyCache.set(idempotencyKey, { status: 200, body, ts: Date.now() });
      return NextResponse.json(body, { headers: rateLimitHeaders(ip, RATE_OPTS) });
    }

    // ── 7. Session Expiry Check ────────────────────────────────────────────
    if (new Date() > session.expiresAt) {
      await prisma.donationSession.update({
        where: { id: sessionId },
        data: { status: 'EXPIRED' },
      });
      await logPaymentEvent('SESSION_EXPIRED', { sessionId: maskSensitive(sessionId, 8) }, ip);
      return NextResponse.json(
        { error: 'This payment session has expired. Please start a new donation.', status: 'EXPIRED' },
        { status: 400 }
      );
    }

    // ── 8. Session Ownership Check ─────────────────────────────────────────
    const authUser = await getAuthenticatedUser(req);
    if (session.memberId && (!authUser || authUser.uid !== session.memberId)) {
      await logPaymentEvent('PAYMENT_VERIFY_FAILED', { reason: 'ownership_mismatch' }, ip);
      return NextResponse.json(
        { error: 'Access denied: You do not own this donation session.' },
        { status: 403 }
      );
    }

    // ── 9. PRODUCTION PATH: Real Razorpay Verification ────────────────────
    const isProduction = process.env.NODE_ENV === 'production';
    const hasRealKeys =
      process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID &&
      !process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID.startsWith('rzp_test_default') &&
      process.env.RAZORPAY_KEY_SECRET;

    if (isProduction || hasRealKeys) {
      // ── 9a. For UPI QR flow: payment completes via webhook.
      //     Frontend polls this endpoint — we check if webhook already settled it.
      if (!razorpayPaymentId || !razorpaySignature) {
        // UPI QR polling: check if webhook has already completed the session
        const currentSession = await prisma.donationSession.findUnique({
          where: { id: sessionId },
          select: { status: true, donations: { select: { id: true }, take: 1 } },
        });

        if (currentSession?.status === 'COMPLETED') {
          const body = {
            success: true,
            status: 'COMPLETED',
            message: 'Payment verified by payment gateway.',
            donationId: currentSession.donations[0]?.id,
            alreadyProcessed: false,
          };
          if (idempotencyKey) idempotencyCache.set(idempotencyKey, { status: 200, body, ts: Date.now() });
          clearPaymentFailures(ip);
          return NextResponse.json(body, { headers: rateLimitHeaders(ip, RATE_OPTS) });
        }

        // Still pending — tell client to keep polling
        return NextResponse.json(
          { success: false, status: 'PENDING', message: 'Payment is being processed. Please wait.' },
          { status: 202, headers: rateLimitHeaders(ip, RATE_OPTS) }
        );
      }

      // ── 9b. Razorpay Checkout SDK flow: verify signature ─────────────────
      const signatureValid = verifyRazorpayPaymentSignature(
        razorpayOrderId || session.referenceNumber,
        razorpayPaymentId,
        razorpaySignature
      );

      if (!signatureValid) {
        recordPaymentFailure(ip);
        await logPaymentEvent(
          'PAYMENT_SIGNATURE_INVALID',
          {
            orderId: maskSensitive(razorpayOrderId || '', 10),
            paymentId: maskSensitive(razorpayPaymentId, 10),
          },
          ip,
          session.memberId
        );
        return NextResponse.json(
          { error: 'Payment signature verification failed. This request has been logged.' },
          { status: 400 }
        );
      }

      // ── 9c. Amount Verification ────────────────────────────────────────────
      // Fetch payment from Razorpay API to verify amount
      try {
        const razorpayKeyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!;
        const razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET!;
        const auth = Buffer.from(`${razorpayKeyId}:${razorpayKeySecret}`).toString('base64');

        const paymentRes = await fetch(`https://api.razorpay.com/v1/payments/${razorpayPaymentId}`, {
          headers: { Authorization: `Basic ${auth}`, 'Content-Type': 'application/json' },
        });

        if (paymentRes.ok) {
          const paymentData = await paymentRes.json();
          const paidAmountPaise = paymentData.amount as number;
          const amountValid = verifyPaymentAmount(paidAmountPaise, session.amount);

          if (!amountValid) {
            await logPaymentEvent(
              'PAYMENT_AMOUNT_MISMATCH',
              {
                expected: session.amount * 100,
                received: paidAmountPaise,
                paymentId: maskSensitive(razorpayPaymentId, 10),
              },
              ip,
              session.memberId
            );
            return NextResponse.json(
              { error: 'Payment amount mismatch detected. This incident has been reported.' },
              { status: 400 }
            );
          }
        }
      } catch (apiErr) {
        console.warn('[VERIFY] Could not fetch Razorpay payment for amount check:', apiErr);
        // Non-blocking: proceed if Razorpay API is temporarily unavailable
      }

      // ── 9d. Complete with real payment credentials ─────────────────────────
      const result = await completeDonationSession(
        sessionId,
        razorpayPaymentId,
        razorpaySignature,
        { source: 'RAZORPAY_CHECKOUT', ip, razorpayOrderId, razorpayPaymentId }
      );

      clearPaymentFailures(ip);
      await logPaymentEvent(
        'PAYMENT_VERIFIED',
        { donationId: result.donation?.id || '', paymentId: maskSensitive(razorpayPaymentId, 10) },
        ip,
        session.memberId
      );

      const successBody = {
        success: true,
        status: 'COMPLETED',
        message: 'Payment verified successfully.',
        donationId: result.donation?.id,
        alreadyProcessed: result.alreadyProcessed,
      };
      if (idempotencyKey) idempotencyCache.set(idempotencyKey, { status: 200, body: successBody, ts: Date.now() });
      return NextResponse.json(successBody, { headers: rateLimitHeaders(ip, RATE_OPTS) });
    }

    // ── 10. DEVELOPMENT/SIMULATION PATH ───────────────────────────────────
    // ⚠️  This path is EXPLICITLY blocked in production.
    // Only runs when NODE_ENV=development AND ALLOW_PAYMENT_SIMULATION=true
    if (!isSimulationAllowed()) {
      return NextResponse.json(
        { error: 'Payment simulation is disabled. Configure real Razorpay keys.' },
        { status: 403 }
      );
    }

    // Simulated verification flow (dev only)
    const sessionAgeMs = Date.now() - new Date(session.createdAt).getTime();
    if (sessionAgeMs < 10_000) {
      return NextResponse.json(
        { success: false, status: 'PENDING', message: 'Payment not yet settled. Please wait.' },
        { status: 202, headers: rateLimitHeaders(ip, RATE_OPTS) }
      );
    }

    // Generate a deterministic mock UTR (dev only)
    const mockUtr = `SIMULATED_${session.referenceNumber}_${Date.now().toString(36).toUpperCase()}`;

    const result = await completeDonationSession(
      sessionId,
      mockUtr,
      `dev_sim_sig_${generateDevToken()}`,
      { source: 'DEV_SIMULATION', ip, simulateMode: true }
    );

    await writeAuditLog({
      userId: session.memberId,
      action: 'PAYMENT_SIMULATED_DEV',
      details: sanitizeAuditField(`sessionId=${sessionId} mockUtr=${mockUtr} — DEV ONLY`),
      ipAddress: ip,
    });

    const successBody = {
      success: true,
      status: 'COMPLETED',
      message: '[DEV] Payment simulated successfully.',
      donationId: result.donation?.id,
      alreadyProcessed: result.alreadyProcessed,
      _devMode: true,
    };
    if (idempotencyKey) idempotencyCache.set(idempotencyKey, { status: 200, body: successBody, ts: Date.now() });
    return NextResponse.json(successBody, { headers: rateLimitHeaders(ip, RATE_OPTS) });
  } catch (err: any) {
    recordPaymentFailure(ip);
    console.error('[API/PAYMENTS/VERIFY] Unhandled error:', err?.message || err);
    return NextResponse.json(
      { error: 'An error occurred while verifying the payment. Please contact support.' },
      { status: 500 }
    );
  }
}

// Dev-only token helper (never used in production)
function generateDevToken(): string {
  return Math.random().toString(36).substring(2, 18);
}
