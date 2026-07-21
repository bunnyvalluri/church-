/**
 * POST /api/donations/test-webhook
 * ─────────────────────────────────────────────────────────────────────────────
 * DEV-ONLY: Simulates Razorpay webhook events for local integration testing.
 *
 * ⚠️  BLOCKED in production — only works when NODE_ENV === 'development'
 *
 * Usage:
 *   POST /api/donations/test-webhook
 *   Body: {
 *     scenario: "payment.captured" | "payment.failed" | "duplicate" | "qr_expiry",
 *     sessionId?: string,   // use existing session, or leave blank to auto-create
 *     amount?: number,      // override amount (for amount mismatch test)
 *   }
 */

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  // ── PRODUCTION GUARD — never expose in prod ────────────────────────────────
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'This endpoint is not available in production.' }, { status: 403 });
  }

  let body: { scenario?: string; sessionId?: string; amount?: number };
  try { body = await req.json(); } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const { scenario = 'payment.captured', sessionId: bodySessionId, amount: overrideAmount } = body;

  try {
    // ── Find or create a test session ─────────────────────────────────────────
    let session = bodySessionId
      ? await prisma.donationSession.findUnique({
          where: { id: bodySessionId },
          include: { purpose: true },
        })
      : null;

    if (!session) {
      // Use the first active purpose
      const purpose = await prisma.donationPurpose.findFirst({ where: { isActive: true } });
      if (!purpose) {
        return NextResponse.json({ error: 'No active donation purposes found. Seed the database first.' }, { status: 404 });
      }

      const testOrderId = `order_test_${crypto.randomBytes(6).toString('hex')}`;
      session = await prisma.donationSession.create({
        data: {
          purposeId: purpose.id,
          amount: overrideAmount || 501,
          currency: 'INR',
          referenceNumber: testOrderId,
          status: 'PENDING',
          paymentState: 'QR_GENERATED',
          expiresAt: new Date(Date.now() + 10 * 60 * 1000),
          donorName: 'Test Donor',
          donorEmail: 'testdonor@kcmchurch.test',
        },
        include: { purpose: true },
      });
    }

    const fakePaymentId = `pay_test_${crypto.randomBytes(8).toString('hex')}`;
    const orderId = session.referenceNumber;
    const amountPaise = Math.round((overrideAmount || session.amount) * 100);

    switch (scenario) {
      case 'payment.captured': {
        // Build a real-looking webhook payload
        const webhookPayload = {
          event: 'payment.captured',
          payload: {
            payment: {
              entity: {
                id: fakePaymentId,
                order_id: orderId,
                amount: amountPaise,
                currency: 'INR',
                status: 'captured',
                method: 'upi',
                vpa: 'testdonor@upi',
              },
            },
          },
          created_at: Math.floor(Date.now() / 1000),
        };

        // Compute signature
        const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || 'dev_test_secret';
        const signature = crypto
          .createHmac('sha256', webhookSecret)
          .update(JSON.stringify(webhookPayload))
          .digest('hex');

        // Call our own webhook endpoint
        const webhookRes = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/payments/webhook`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-razorpay-signature': signature,
          },
          body: JSON.stringify(webhookPayload),
        });

        const webhookResult = await webhookRes.json();
        return NextResponse.json({
          success: true,
          scenario,
          sessionId: session.id,
          orderId,
          fakePaymentId,
          webhookResult,
          message: `✅ Simulated payment.captured webhook. Check donation records and notifications.`,
        });
      }

      case 'payment.failed': {
        await prisma.donationSession.update({
          where: { id: session.id },
          data: { status: 'FAILED', paymentState: 'FAILED' },
        });
        return NextResponse.json({
          success: true,
          scenario,
          sessionId: session.id,
          message: '✅ Session marked as FAILED for testing.',
        });
      }

      case 'duplicate': {
        // Send the same payload twice to test deduplication
        const webhookPayload = {
          event: 'payment.captured',
          payload: {
            payment: {
              entity: {
                id: `pay_dup_${crypto.randomBytes(4).toString('hex')}`,
                order_id: orderId,
                amount: amountPaise,
                currency: 'INR',
                status: 'captured',
                method: 'upi',
              },
            },
          },
          created_at: Math.floor(Date.now() / 1000),
        };
        const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || 'dev_test_secret';
        const sig = crypto.createHmac('sha256', webhookSecret).update(JSON.stringify(webhookPayload)).digest('hex');
        const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
        const opts = { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-razorpay-signature': sig }, body: JSON.stringify(webhookPayload) };

        const [res1, res2] = await Promise.all([
          fetch(`${baseUrl}/api/payments/webhook`, opts).then(r => r.json()),
          fetch(`${baseUrl}/api/payments/webhook`, opts).then(r => r.json()),
        ]);
        return NextResponse.json({ success: true, scenario, sessionId: session.id, first: res1, second: res2, message: '✅ Duplicate webhook test complete.' });
      }

      case 'qr_expiry': {
        await prisma.donationSession.update({
          where: { id: session.id },
          data: { status: 'EXPIRED', paymentState: 'EXPIRED', expiresAt: new Date(Date.now() - 1000) },
        });
        return NextResponse.json({ success: true, scenario, sessionId: session.id, message: '✅ Session expired for QR expiry testing.' });
      }

      case 'amount_mismatch': {
        // Webhook with wrong amount (security test)
        const webhookPayload = {
          event: 'payment.captured',
          payload: {
            payment: {
              entity: {
                id: fakePaymentId,
                order_id: orderId,
                amount: Math.round(session.amount * 50), // 50% of real amount
                currency: 'INR',
                status: 'captured',
                method: 'upi',
              },
            },
          },
          created_at: Math.floor(Date.now() / 1000),
        };
        const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || 'dev_test_secret';
        const sig = crypto.createHmac('sha256', webhookSecret).update(JSON.stringify(webhookPayload)).digest('hex');
        const res = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/payments/webhook`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'x-razorpay-signature': sig },
          body: JSON.stringify(webhookPayload),
        });
        return NextResponse.json({ success: true, scenario, result: await res.json(), message: '✅ Amount mismatch test — webhook should reject with amount_mismatch.' });
      }

      default:
        return NextResponse.json({ error: `Unknown scenario: ${scenario}`, available: ['payment.captured', 'payment.failed', 'duplicate', 'qr_expiry', 'amount_mismatch'] }, { status: 400 });
    }

  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Test webhook failed' }, { status: 500 });
  }
}
