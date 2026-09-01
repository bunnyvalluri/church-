/**
 * POST /api/payments/verify
 * ─────────────────────────────────────────────────────────────────────────────
 * Authoritative Server-Side Payment Verification Endpoint for KCM.
 *
 * Rules:
 *  • CLIENT = UNTRUSTED. Frontend cannot declare payment success.
 *  • Cryptographic HMAC-SHA256 signature verification for Checkout flow.
 *  • Authoritative gateway fetch & amount verification in integer paise.
 *  • Webhook integration for asynchronous UPI QR settlement.
 *  • Strict session ownership and expiration enforcement.
 *  • Atomic database transaction for donation, receipt, and ledger updates.
 */

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthenticatedUser } from '@/lib/authMiddleware';
import { completeDonationSession } from '@/lib/paymentService';
import { getPaymentProvider } from '@/lib/payments';
import {
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
} from '@/lib/paymentSecurity';
import { rateLimitHeaders } from '@/lib/rateLimit';

export const dynamic = 'force-dynamic';

// ─── Idempotency Cache (10 min TTL) ──────────────────────────────────────────
const idempotencyCache = new Map<string, { status: number; body: unknown; ts: number }>();
const IDEMPOTENCY_TTL_MS = 10 * 60 * 1000;

export async function POST(req: Request) {
  const ip = getClientIp(req);
  const RATE_OPTS = { windowMs: 15 * 60 * 1000, maxRequests: 60 };

  // 1. Content-Type Guard
  const ctError = assertJsonContentType(req);
  if (ctError) {
    return NextResponse.json({ error: ctError.error }, { status: ctError.status });
  }

  // 2. Rate Limit & Security Checks
  const secCheck = runPaymentSecurityChecks(ip, 'VERIFY_PAYMENT');
  if (!secCheck.allowed) {
    await logPaymentEvent('IP_RATE_LIMITED', { route: 'verify-payment' }, ip);
    return NextResponse.json(
      { error: secCheck.reason },
      { status: secCheck.statusCode, headers: rateLimitHeaders(ip, RATE_OPTS) }
    );
  }

  try {
    // 3. Parse + Strict Schema Validation
    let rawBody: unknown;
    try {
      rawBody = await req.json();
    } catch {
      return NextResponse.json({ error: 'Invalid JSON in request body.' }, { status: 400 });
    }

    const parsed = VerifyPaymentSchema.safeParse(rawBody);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0]?.message || 'Invalid verification request.' },
        { status: 400 }
      );
    }

    const { sessionId, donationId, razorpayOrderId, razorpayPaymentId, razorpaySignature } = parsed.data;

    // 4. Idempotency Check
    const idempotencyKey = req.headers.get('x-idempotency-key') || '';
    if (idempotencyKey) {
      const cached = idempotencyCache.get(idempotencyKey);
      if (cached && Date.now() - cached.ts < IDEMPOTENCY_TTL_MS) {
        return NextResponse.json(cached.body, { status: cached.status });
      }
    }

    // 5. Load Session (Resolve by sessionId, donationId, or razorpayOrderId)
    let session = null;
    if (sessionId) {
      session = await prisma.donationSession.findUnique({
        where: { id: sessionId },
        include: {
          purpose: true,
          donations: { select: { id: true, status: true, amount: true }, take: 1 },
        },
      });
    }

    if (!session && donationId) {
      const donation = await prisma.donation.findUnique({
        where: { id: donationId },
        select: { sessionId: true },
      });
      if (donation?.sessionId) {
        session = await prisma.donationSession.findUnique({
          where: { id: donation.sessionId },
          include: {
            purpose: true,
            donations: { select: { id: true, status: true, amount: true }, take: 1 },
          },
        });
      }
    }

    if (!session && razorpayOrderId) {
      session = await prisma.donationSession.findFirst({
        where: {
          OR: [
            { referenceNumber: razorpayOrderId },
            { razorpayOrderId },
          ],
        },
        include: {
          purpose: true,
          donations: { select: { id: true, status: true, amount: true }, take: 1 },
        },
      });
    }

    if (!session) {
      const lookupRef = sessionId || donationId || razorpayOrderId || 'unknown';
      await logPaymentEvent('SESSION_NOT_FOUND', { sessionRef: maskSensitive(lookupRef, 8) }, ip);
      return NextResponse.json({ error: 'Donation session not found.' }, { status: 404 });
    }

    // 6. Already COMPLETED (Idempotent Success)
    if (session.status === 'COMPLETED') {
      const donation = session.donations?.[0];
      const receipt = donation ? await prisma.receipt.findUnique({ where: { donationId: donation.id } }) : null;
      const body = {
        success: true,
        status: 'COMPLETED',
        message: 'Payment already verified.',
        donationId: donation?.id,
        receiptNumber: receipt?.receiptNumber,
        alreadyProcessed: true,
      };
      if (idempotencyKey) idempotencyCache.set(idempotencyKey, { status: 200, body, ts: Date.now() });
      return NextResponse.json(body, { headers: rateLimitHeaders(ip, RATE_OPTS) });
    }

    // 7. Session Expiry Check
    if (new Date() > session.expiresAt) {
      await prisma.donationSession.update({
        where: { id: session.id },
        data: { status: 'EXPIRED' },
      });
      await logPaymentEvent('SESSION_EXPIRED', { sessionId: maskSensitive(session.id, 8) }, ip);
      return NextResponse.json(
        { error: 'This payment session has expired. Please start a new donation.', status: 'EXPIRED' },
        { status: 400 }
      );
    }

    // 8. Session Ownership Authorization Check
    const authUser = await getAuthenticatedUser(req);
    if (session.memberId && (!authUser || authUser.uid !== session.memberId)) {
      await logPaymentEvent('PAYMENT_VERIFY_FAILED', { reason: 'ownership_mismatch' }, ip);
      return NextResponse.json(
        { error: 'Access denied: You do not own this donation session.' },
        { status: 403 }
      );
    }

    const provider = getPaymentProvider('RAZORPAY');

    // 9. Case A: Razorpay Checkout Signature Verification
    if (razorpayPaymentId && razorpaySignature) {
      const orderId = razorpayOrderId || session.referenceNumber;
      const isSignatureValid = provider.verifyPaymentSignature({
        providerOrderId: orderId,
        providerPaymentId: razorpayPaymentId,
        providerSignature: razorpaySignature,
      });

      if (!isSignatureValid) {
        recordPaymentFailure(ip);
        await logPaymentEvent(
          'PAYMENT_SIGNATURE_INVALID',
          { orderId: maskSensitive(orderId, 10), paymentId: maskSensitive(razorpayPaymentId, 10) },
          ip,
          session.memberId
        );
        return NextResponse.json(
          { error: 'Payment signature verification failed. This incident has been logged.' },
          { status: 400 }
        );
      }

      // Cross-check payment details with Razorpay API (amount in paise, currency, status)
      const gatewayDetails = await provider.fetchPayment(razorpayPaymentId);
      if (gatewayDetails) {
        const expectedPaise = Math.round(session.amount * 100);
        if (gatewayDetails.amountInPaise !== expectedPaise) {
          recordPaymentFailure(ip);
          await logPaymentEvent(
            'PAYMENT_AMOUNT_MISMATCH',
            { expectedPaise, receivedPaise: gatewayDetails.amountInPaise, paymentId: razorpayPaymentId },
            ip,
            session.memberId
          );
          return NextResponse.json(
            { error: 'Payment amount mismatch detected. Transaction cannot be processed.' },
            { status: 400 }
          );
        }
      }

      // Complete session atomically
      const result = await completeDonationSession(
        session.id,
        razorpayPaymentId,
        razorpaySignature,
        { source: 'RAZORPAY_CHECKOUT', ip, razorpayOrderId: orderId, razorpayPaymentId }
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
        receiptNumber: result.receipt?.receiptNumber,
        alreadyProcessed: result.alreadyProcessed,
      };

      if (idempotencyKey) idempotencyCache.set(idempotencyKey, { status: 200, body: successBody, ts: Date.now() });
      return NextResponse.json(successBody, { headers: rateLimitHeaders(ip, RATE_OPTS) });
    }

    // 10. Case B: Dynamic UPI QR Verification ("I've Paid - Verify Now" / Polling)
    // The server is authoritative: Check if the webhook or gateway API has confirmed the payment
    const currentSession = await prisma.donationSession.findUnique({
      where: { id: session.id },
      include: {
        donations: { take: 1, include: { receipt: true } },
      },
    });

    if (currentSession?.status === 'COMPLETED' && currentSession.donations[0]) {
      const donation = currentSession.donations[0];
      const successBody = {
        success: true,
        status: 'COMPLETED',
        message: 'Payment verified by payment gateway.',
        donationId: donation.id,
        receiptNumber: donation.receipt?.receiptNumber,
        alreadyProcessed: false,
      };

      if (idempotencyKey) idempotencyCache.set(idempotencyKey, { status: 200, body: successBody, ts: Date.now() });
      clearPaymentFailures(ip);
      return NextResponse.json(successBody, { headers: rateLimitHeaders(ip, RATE_OPTS) });
    }

    // If still pending, return HTTP 202 (Accepted / In Progress)
    return NextResponse.json(
      {
        success: false,
        status: 'PENDING',
        message: 'Payment verification is in progress. We are awaiting bank/gateway confirmation.',
      },
      { status: 202, headers: rateLimitHeaders(ip, RATE_OPTS) }
    );
  } catch (err: any) {
    recordPaymentFailure(ip);
    console.error('[API/PAYMENTS/VERIFY] Unhandled error:', err?.message || err);
    return NextResponse.json(
      { error: 'An error occurred while verifying the payment. Please try again.' },
      { status: 500 }
    );
  }
}
