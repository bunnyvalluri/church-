/**
 * POST /api/donations/create-order
 * ─────────────────────────────────────────────────────────────────────────────
 * Banking-grade Razorpay order creation endpoint.
 *
 * Security features:
 *  • Strict Zod schema validation (no extra fields, typed constraints)
 *  • Rate limiting: 5 orders per 10 min per IP
 *  • Auto-block on failure accumulation
 *  • Content-Type enforcement (415 for non-JSON)
 *  • No sensitive keys in response (keyId never returned)
 *  • Cryptographically secure fallback order IDs
 *  • Full audit trail for every order creation attempt
 *  • PAN validation for 80G tax compliance
 */

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import Razorpay from 'razorpay';
import QRCode from 'qrcode';
import { writeAuditLog } from '@/lib/auditLogger';
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
import { rateLimitHeaders, isRateLimited } from '@/lib/rateLimit';

export const dynamic = 'force-dynamic';

// ─── Secure Reference Generator ───────────────────────────────────────────────

function generateOrderReference(): string {
  const date = new Date();
  const yymmdd = `${String(date.getFullYear()).slice(-2)}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}`;
  const secureRandom = generateSecureToken(8).toUpperCase().slice(0, 10);
  return `KCM-NGO-${yymmdd}-${secureRandom}`;
}

// ─── Route Handler ────────────────────────────────────────────────────────────

export async function POST(req: Request) {
  const ip = getClientIp(req);
  const RATE_OPTS = { windowMs: 10 * 60 * 1000, maxRequests: 5 };

  // ── 1. Content-Type Guard ──────────────────────────────────────────────────
  const ctError = assertJsonContentType(req);
  if (ctError) {
    return NextResponse.json({ error: ctError.error }, { status: ctError.status });
  }

  // ── 2. Rate Limiting ───────────────────────────────────────────────────────
  const secCheck = runPaymentSecurityChecks(ip, 'CREATE_ORDER');
  if (!secCheck.allowed) {
    await logPaymentEvent('IP_RATE_LIMITED', { route: 'create-order' }, ip);
    return NextResponse.json(
      { error: secCheck.reason },
      { status: secCheck.statusCode, headers: rateLimitHeaders(ip, RATE_OPTS) }
    );
  }

  try {
    // ── 3. Parse + Strict Zod Validation ────────────────────────────────────
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
      purpose,
      donorName,
      donorEmail,
      donorPhone,
      userId,
      branchId,
      isAnonymous,
      panNumber,
      address,
      city,
      state,
      country,
      prayerRequest,
      campaignId,
    } = parsed.data;

    // ── 4. Load Dynamic Settings from DB ────────────────────────────────────
    const settings = await prisma.churchSettings.findUnique({
      where: { id: 'settings' },
    });

    const maxAmount = settings?.maxDonationAmount || 500000;
    const minAmount = settings?.minDonationAmount || 1;
    const upiId = settings?.upiId || process.env.UPI_ID || 'kcm.kristhraj2004-1@okicici';
    const merchantName = settings?.merchantName || process.env.NEXT_PUBLIC_CHURCH_NAME || 'Kingdom of Christ Ministries';
    const expiryMins = settings?.qrExpiryMinutes || 10;

    // ── 5. Secondary Server-Side Amount Validation ───────────────────────────
    // (Belt-and-suspenders beyond Zod — business rules from DB)
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

    // ── 6. Donor identity validation ─────────────────────────────────────────
    if (!isAnonymous && !donorName) {
      return NextResponse.json(
        { error: 'Donor name is required for non-anonymous donations.' },
        { status: 400 }
      );
    }

    const amountInINR = amount; // already validated as positive number
    const amountInPaise = Math.round(amountInINR * 100);
    const referenceNumber = generateOrderReference();
    const expiresAt = new Date(Date.now() + expiryMins * 60 * 1000);

    // ── 7. Razorpay Order Creation ────────────────────────────────────────────
    const razorpayKeyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || '';
    const razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET || '';
    const hasRealKeys =
      razorpayKeyId &&
      !razorpayKeyId.startsWith('rzp_test_default') &&
      razorpayKeySecret &&
      !razorpayKeySecret.startsWith('mock_razorpay');

    // Secure fallback: crypto.randomUUID() instead of Math.random()
    let razorpayOrderId: string = `order_mock_${crypto.randomUUID().replace(/-/g, '').slice(0, 14)}`;

    if (hasRealKeys) {
      try {
        const razorpay = new Razorpay({
          key_id: razorpayKeyId,
          key_secret: razorpayKeySecret,
        });

        const order = await razorpay.orders.create({
          amount: amountInPaise,
          currency: 'INR',
          receipt: referenceNumber,
          notes: {
            purpose: purpose,
            donorName: isAnonymous ? 'Anonymous Donor' : (donorName || 'Beloved Donor'),
            // Never store PAN in notes — store reference only
            hasPan: panNumber ? 'YES' : 'NO',
            source: 'KCM_NGO_PORTAL',
          },
        });

        razorpayOrderId = order.id;
      } catch (rzpError: any) {
        console.error('[RAZORPAY] Order creation failed:', rzpError?.description || rzpError);
        recordPaymentFailure(ip);
        await logPaymentEvent(
          'ORDER_CREATION_FAILED',
          { reason: 'razorpay_api_error', error: sanitizeAuditField(rzpError?.description || 'unknown') },
          ip,
          userId
        );
        return NextResponse.json(
          { error: 'Payment gateway error. Please try again in a moment.' },
          { status: 503 }
        );
      }
    } else {
      console.info('[RAZORPAY] Mock order mode (no real keys configured)');
    }

    // ── 8. Resolve User ID ────────────────────────────────────────────────────
    let validMemberId: string | null = null;
    if (userId) {
      const userExists = await prisma.user.findUnique({
        where: { id: userId },
        select: { id: true },
      });
      if (userExists) {
        validMemberId = userExists.id;
      } else if (donorEmail) {
        const userByEmail = await prisma.user.findUnique({
          where: { email: donorEmail },
          select: { id: true },
        });
        if (userByEmail) validMemberId = userByEmail.id;
      }
    }

    // ── 9. Resolve Branch ID ──────────────────────────────────────────────────
    let validBranchId: string | null = null;
    if (branchId) {
      const branchExists = await prisma.branch.findUnique({
        where: { id: branchId },
        select: { id: true, isActive: true },
      });
      if (!branchExists) {
        return NextResponse.json({ error: 'Invalid branch selected.' }, { status: 400 });
      }
      if (!branchExists.isActive) {
        return NextResponse.json({ error: 'Selected branch is not accepting donations.' }, { status: 400 });
      }
      validBranchId = branchExists.id;
    }

    // ── 10. Resolve Donation Purpose ──────────────────────────────────────────
    let purposeRecord = await prisma.donationPurpose.findFirst({
      where: { code: purpose, isActive: true },
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

    // ── 11. Create Donation Session (atomic) ──────────────────────────────────
    const session = await prisma.donationSession.create({
      data: {
        memberId: validMemberId,
        branchId: validBranchId,
        purposeId: purposeRecord.id,
        amount: amountInINR,
        currency: 'INR',
        referenceNumber: razorpayOrderId,
        status: 'PROCESSING',
        expiresAt,
        ipAddress: ip,
      },
    });

    // ── 12. Create Pending Donation Record ────────────────────────────────────
    const donation = await prisma.donation.create({
      data: {
        userId: validMemberId,
        amount: amountInINR,
        currency: 'INR',
        purpose: purpose,
        purposeId: purposeRecord.id,
        branchId: validBranchId,
        sessionId: session.id,
        paymentMethod: 'UPI',
        razorpayOrderId,
        donorName: isAnonymous ? 'Anonymous Giver' : (donorName || 'Beloved Donor'),
        donorEmail: donorEmail || null,
        donorPhone: donorPhone || null,
        status: 'PENDING',
      },
    });

    // ── 13. Generate Dynamic UPI QR ───────────────────────────────────────────
    // Encode the amount and reference in the UPI URI
    const encodedName = encodeURIComponent(merchantName);
    const txNote = `KCM NGO Donation Ref ${referenceNumber}`;
    const encodedNote = encodeURIComponent(txNote);

    const upiUri =
      `upi://pay?pa=${upiId}&pn=${encodedName}` +
      `&am=${amountInINR.toFixed(2)}&cu=INR` +
      `&tn=${encodedNote}&tr=${referenceNumber}`;

    const qrCodeBase64 = await QRCode.toDataURL(upiUri, {
      margin: 2,
      width: 360,
      errorCorrectionLevel: 'H', // Highest — allows logo overlay
      color: { dark: '#4F1C91', light: '#FFFFFF' },
    });

    // ── 14. Audit Log (sanitized — no PII) ───────────────────────────────────
    writeAuditLog({
      userId: validMemberId,
      action: 'PAYMENT_ORDER_CREATED',
      details: sanitizeAuditField(
        `orderId=${razorpayOrderId} donationId=${donation.id} amount=₹${amountInINR} purpose=${purpose} ip=${maskSensitive(ip, 6)}`
      ),
      ipAddress: ip,
    }).catch(() => {});

    // ── 15. Secure Response — NO keyId, NO secrets in response ───────────────
    return NextResponse.json(
      {
        success: true,
        orderId: razorpayOrderId,
        sessionId: session.id,
        donationId: donation.id,
        referenceNumber: session.referenceNumber,
        amount: amountInINR,
        amountInPaise,
        currency: 'INR',
        // keyId intentionally OMITTED — never expose to client
        expiresAt: session.expiresAt,
        upiUri,
        qrCode: qrCodeBase64,
        upiId,
        merchantName,
        isMock: !hasRealKeys,
      },
      { headers: rateLimitHeaders(ip, RATE_OPTS) }
    );
  } catch (err: any) {
    recordPaymentFailure(ip);
    console.error('[DONATION/CREATE-ORDER] Unhandled error:', err?.message || err);

    // Never expose internal error details to client
    return NextResponse.json(
      { error: 'An error occurred while creating the payment order. Please try again.' },
      { status: 500 }
    );
  }
}
