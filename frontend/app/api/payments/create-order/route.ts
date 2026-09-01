/**
 * POST /api/payments/create-order
 * ─────────────────────────────────────────────────────────────────────────────
 * Production Payment Order Creation Endpoint for KCM Platform.
 *
 * Security principles:
 *  • Client = Untrusted. Authenticated member resolved server-side from session.
 *  • Strict Zod schema validation (parameter pollution prevention).
 *  • Zero trust: Server validates amount against DB church settings in integer paise.
 *  • Pluggable PaymentProvider abstraction (Razorpay).
 *  • Atomically stores DonationSession & Donation records.
 *  • Returns only safe payload required by Razorpay Checkout & UPI QR.
 *  • Never exposes secret keys or backend credentials in responses.
 */

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthenticatedUser } from '@/lib/authMiddleware';
import { writeAuditLog } from '@/lib/auditLogger';
import { getPaymentProvider } from '@/lib/payments';
import {
  CreateOrderSchema,
  assertJsonContentType,
  getClientIp,
  generateSecureToken,
  maskSensitive,
  sanitizeAuditField,
} from '@/lib/security';
import {
  runPaymentSecurityChecks,
  recordPaymentFailure,
  logPaymentEvent,
} from '@/lib/paymentSecurity';
import { rateLimitHeaders } from '@/lib/rateLimit';

export const dynamic = 'force-dynamic';

function generateOrderReference(): string {
  const date = new Date();
  const yymmdd = `${String(date.getFullYear()).slice(-2)}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}`;
  const secureRandom = generateSecureToken(6).toUpperCase();
  return `KCM-ORD-${yymmdd}-${secureRandom}`;
}

export async function POST(req: Request) {
  const ip = getClientIp(req);
  const RATE_OPTS = { windowMs: 10 * 60 * 1000, maxRequests: 60 };

  // 1. Content-Type Guard
  const ctError = assertJsonContentType(req);
  if (ctError) {
    return NextResponse.json({ error: ctError.error }, { status: ctError.status });
  }

  // 2. Rate Limiting & Security Checks
  const secCheck = runPaymentSecurityChecks(ip, 'CREATE_ORDER');
  if (!secCheck.allowed) {
    await logPaymentEvent('IP_RATE_LIMITED', { route: 'payments/create-order' }, ip);
    return NextResponse.json(
      { error: secCheck.reason },
      { status: secCheck.statusCode, headers: rateLimitHeaders(ip, RATE_OPTS) }
    );
  }

  try {
    // 3. Resolve Authenticated Member from Server Session (Never trust client-supplied userId alone)
    const authUser = await getAuthenticatedUser(req);

    // 4. Parse + Strict Schema Validation
    let rawBody: unknown;
    try {
      rawBody = await req.json();
    } catch {
      return NextResponse.json({ error: 'Invalid JSON in request body.' }, { status: 400 });
    }

    const parsed = CreateOrderSchema.safeParse(rawBody);
    if (!parsed.success) {
      const firstError = parsed.error.errors[0];
      await logPaymentEvent(
        'ORDER_CREATION_FAILED',
        { reason: 'validation_failed', field: firstError.path.join('.'), message: firstError.message },
        ip
      );
      return NextResponse.json(
        {
          error: firstError.message || 'Invalid request data.',
          field: firstError.path.join('.'),
        },
        { status: 400 }
      );
    }

    const {
      amount,
      purpose: rawPurpose,
      purposeCode: rawPurposeCode,
      donorName: rawDonorName,
      donorEmail: rawDonorEmail,
      donorPhone: rawDonorPhone,
      branchId,
      isAnonymous,
      panNumber,
      prayerRequest,
      campaignId,
    } = parsed.data;

    const purposeCode = rawPurpose || rawPurposeCode || 'GENERAL';

    // 5. Load Dynamic Church Settings from DB
    const settings = await prisma.churchSettings.findUnique({
      where: { id: 'settings' },
    });

    const maxAmount = settings?.maxDonationAmount || 500000;
    const minAmount = settings?.minDonationAmount || 1;

    // 6. Server-Side Amount Validation (Integer paise precision)
    if (amount < minAmount) {
      return NextResponse.json(
        { error: `Minimum donation amount is ₹${minAmount.toLocaleString('en-IN')}` },
        { status: 400 }
      );
    }
    if (amount > maxAmount) {
      return NextResponse.json(
        { error: `Maximum donation per transaction is ₹${maxAmount.toLocaleString('en-IN')}` },
        { status: 400 }
      );
    }

    // 7. Resolve Server-side Identity & Contact Info
    let effectiveMemberId: string | null = null;
    let donorName = rawDonorName || '';
    let donorEmail = rawDonorEmail || '';
    let donorPhone = rawDonorPhone || '';

    if (authUser?.uid) {
      effectiveMemberId = authUser.uid;
      const dbUser = await prisma.user.findUnique({
        where: { id: authUser.uid },
        select: { id: true, name: true, email: true, phone: true },
      });
      if (dbUser) {
        effectiveMemberId = dbUser.id;
        donorName = donorName || dbUser.name;
        donorEmail = donorEmail || dbUser.email;
        donorPhone = donorPhone || dbUser.phone || '';
      }
    }

    if (!isAnonymous && !donorName.trim()) {
      return NextResponse.json(
        { error: 'Donor name is required for non-anonymous donations.' },
        { status: 400 }
      );
    }

    const amountInINR = Number(amount);
    const referenceNumber = generateOrderReference();

    // 8. Resolve Foreign Keys (Branch & Purpose)
    let validBranchId: string | null = null;
    if (branchId) {
      const branchExists = await prisma.branch.findUnique({
        where: { id: branchId },
        select: { id: true },
      });
      if (branchExists) {
        validBranchId = branchExists.id;
      }
    }

    let purposeRecord = await prisma.donationPurpose.findFirst({
      where: { code: purposeCode, isActive: true },
    });

    if (!purposeRecord) {
      purposeRecord = await prisma.donationPurpose.findFirst({
        where: { isActive: true },
        orderBy: { createdAt: 'asc' },
      });
    }

    if (!purposeRecord) {
      return NextResponse.json(
        { error: 'Invalid donation purpose. Please refresh and try again.' },
        { status: 400 }
      );
    }

    // 9. Delegate Gateway Order Creation to PaymentProvider
    const provider = getPaymentProvider('RAZORPAY');
    let orderResult;
    try {
      orderResult = await provider.createOrder({
        amountInINR,
        purpose: purposeRecord.code,
        purposeId: purposeRecord.id,
        referenceNumber,
        donorName: isAnonymous ? 'Anonymous Donor' : (donorName || 'Beloved Donor'),
        donorEmail: donorEmail || null,
        donorPhone: donorPhone || null,
        panNumber: panNumber || null,
        isAnonymous: Boolean(isAnonymous),
        branchId: validBranchId,
        userId: effectiveMemberId,
      });
    } catch (gatewayErr: any) {
      recordPaymentFailure(ip);
      await logPaymentEvent(
        'ORDER_CREATION_FAILED',
        { reason: 'gateway_error', message: sanitizeAuditField(gatewayErr?.message || 'unknown') },
        ip,
        effectiveMemberId
      );
      return NextResponse.json(
        { error: gatewayErr?.message || 'Payment gateway order creation failed. Please try again.' },
        { status: 503 }
      );
    }

    // 10. Persist Session & Donation in DB Atomically
    const { session, donation } = await prisma.$transaction(async (tx) => {
      const createdSession = await tx.donationSession.create({
        data: {
          memberId: effectiveMemberId,
          branchId: validBranchId,
          purposeId: purposeRecord!.id,
          amount: amountInINR,
          currency: 'INR',
          referenceNumber: orderResult.providerOrderId,
          razorpayOrderId: orderResult.providerOrderId,
          campaignId: campaignId || null,
          donorName: isAnonymous ? 'Anonymous Giver' : (donorName || 'Beloved Donor'),
          donorEmail: donorEmail || null,
          donorPhone: donorPhone || null,
          panNumber: panNumber || null,
          prayerRequest: prayerRequest || null,
          isAnonymous: Boolean(isAnonymous),
          status: 'PROCESSING',
          paymentState: 'CREATED',
          expiresAt: orderResult.expiresAt,
          ipAddress: ip,
        },
      });

      const createdDonation = await tx.donation.create({
        data: {
          userId: effectiveMemberId,
          amount: amountInINR,
          currency: 'INR',
          purpose: purposeRecord!.code,
          purposeId: purposeRecord!.id,
          branchId: validBranchId,
          sessionId: createdSession.id,
          campaignId: campaignId || null,
          paymentMethod: 'RAZORPAY_UPI',
          razorpayOrderId: orderResult.providerOrderId,
          donorName: isAnonymous ? 'Anonymous Giver' : (donorName || 'Beloved Donor'),
          donorEmail: donorEmail || null,
          donorPhone: donorPhone || null,
          panNumber: panNumber || null,
          prayerRequest: prayerRequest || null,
          isAnonymous: Boolean(isAnonymous),
          status: 'PENDING',
        },
      });

      return { session: createdSession, donation: createdDonation };
    });

    // 11. Structured Audit Log
    writeAuditLog({
      userId: effectiveMemberId,
      action: 'PAYMENT_ORDER_CREATED',
      details: sanitizeAuditField(
        `orderId=${orderResult.providerOrderId} donationId=${donation.id} amount=₹${amountInINR} purpose=${purposeCode} ip=${maskSensitive(ip, 6)}`
      ),
      ipAddress: ip,
    }).catch(() => {});

    // 12. Safe Public-Facing Response
    return NextResponse.json(
      {
        success: true,
        orderId: orderResult.providerOrderId,
        sessionId: session.id,
        donationId: donation.id,
        referenceNumber: session.referenceNumber,
        amount: amountInINR,
        amountInPaise: orderResult.amountInPaise,
        currency: 'INR',
        expiresAt: orderResult.expiresAt,
        upiUri: orderResult.upiUri,
        qrCode: orderResult.qrCode,
        isMock: orderResult.isMock,
        keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || '',
      },
      { headers: rateLimitHeaders(ip, RATE_OPTS) }
    );
  } catch (err: any) {
    recordPaymentFailure(ip);
    console.error('[API/PAYMENTS/CREATE-ORDER] Unhandled error:', err?.message || err);

    return NextResponse.json(
      { error: err?.message || 'An error occurred while creating the payment order. Please try again.' },
      { status: 500 }
    );
  }
}
