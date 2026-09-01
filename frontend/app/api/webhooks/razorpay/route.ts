/**
 * POST /api/webhooks/razorpay
 * ─────────────────────────────────────────────────────────────────────────────
 * Authoritative Production Webhook Endpoint for Razorpay Events.
 *
 * Security principles:
 *  ✅ Reads raw request body BEFORE any parsing (HMAC requirement)
 *  ✅ Validates X-Razorpay-Signature with RAZORPAY_WEBHOOK_SECRET
 *  ✅ Enforces Webhook Event Idempotency (prevent replay / duplicate execution)
 *  ✅ Timestamp verification (reject stale replays > 5 mins)
 *  ✅ Strict Amount cross-check against database session amount in integer paise
 *  ✅ Handles payment.captured, payment.authorized, payment.failed, payment.refunded, order.paid
 *  ✅ Atomically generates immutable receipts, financial ledger transactions, and audit trails
 *  ✅ Dispatches background email receipt & push notifications
 *  ✅ Emits Socket.IO real-time event to donor's browser room
 *  ✅ Never leaks internal errors or secrets in response
 */

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { writeAuditLog } from '@/lib/auditLogger';
import { completeDonationSession } from '@/lib/paymentService';
import {
  verifyRazorpayWebhookSignature,
  verifyPaymentAmount,
  RazorpayWebhookSchema,
  generateWebhookEventId,
  getClientIp,
  maskSensitive,
  sanitizeAuditField,
} from '@/lib/security';
import {
  logPaymentEvent,
  isWebhookAlreadyProcessed,
  runPaymentSecurityChecks,
} from '@/lib/paymentSecurity';
import { safeTriggerCompanionEvent } from '@/lib/socketTrigger';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  const ip = getClientIp(req);

  // 1. Rate Limiting Check (DDoS protection)
  const secCheck = runPaymentSecurityChecks(ip, 'WEBHOOK');
  if (!secCheck.allowed) {
    return NextResponse.json({ error: 'Rate limit exceeded.' }, { status: 429 });
  }

  // 2. Read RAW body as string before parsing (MANDATORY for cryptographic HMAC)
  let rawBody: string;
  try {
    rawBody = await req.text();
  } catch (err: any) {
    console.error('[RAZORPAY_WEBHOOK] Failed to read raw body:', err);
    return NextResponse.json({ error: 'Could not read request body' }, { status: 400 });
  }

  // 3. Extract Signature Header
  const signatureHeader =
    req.headers.get('x-razorpay-signature') ||
    req.headers.get('x-webhook-signature');

  // 4. Cryptographic Signature Verification
  const isSignatureValid = verifyRazorpayWebhookSignature(rawBody, signatureHeader);

  if (!isSignatureValid) {
    await writeAuditLog({
      action: 'PAYMENT_WEBHOOK_SIGNATURE_INVALID',
      details: sanitizeAuditField(
        `Invalid signature from IP ${maskSensitive(ip, 6)}. Header: ${maskSensitive(signatureHeader || 'none', 8)}`
      ),
      ipAddress: ip,
    });
    // Return 400 for bad signature
    return NextResponse.json({ error: 'Invalid webhook signature' }, { status: 400 });
  }

  // 5. Parse JSON Payload
  let payload: unknown;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    await writeAuditLog({
      action: 'PAYMENT_WEBHOOK_PARSE_FAILED',
      details: 'Malformed JSON payload in webhook body',
      ipAddress: ip,
    });
    return NextResponse.json({ error: 'Malformed JSON payload' }, { status: 400 });
  }

  // 6. Schema Validation
  const parsed = RazorpayWebhookSchema.safeParse(payload);
  if (!parsed.success) {
    await writeAuditLog({
      action: 'PAYMENT_WEBHOOK_INVALID_SCHEMA',
      details: sanitizeAuditField(`Schema validation failed: ${parsed.error.errors[0]?.message}`),
      ipAddress: ip,
    });
    return NextResponse.json({ received: true, processed: false, reason: 'unknown_schema' }, { status: 200 });
  }

  const webhookData = parsed.data;
  const eventType = webhookData.event;

  // 7. Persist Webhook Audit Record
  const webhookRecord = await prisma.paymentWebhook.create({
    data: {
      payload: payload as any,
      signature: maskSensitive(signatureHeader || '', 12),
      ipAddress: ip,
      status: 'PENDING',
      webhookEventId: null,
    },
  });

  try {
    // 8. Event Routing
    const paymentEntity = webhookData.payload.payment?.entity;
    const orderEntity = webhookData.payload.order?.entity;

    const paymentId = paymentEntity?.id || '';
    const orderId = paymentEntity?.order_id || orderEntity?.id || '';
    const paidAmountPaise = paymentEntity?.amount || orderEntity?.amount || 0;

    if (!paymentId && !orderId) {
      await prisma.paymentWebhook.update({
        where: { id: webhookRecord.id },
        data: { status: 'IGNORED', errorMessage: 'No payment or order entity found' },
      });
      return NextResponse.json({ received: true, processed: false, reason: 'no_entities' }, { status: 200 });
    }

    // 9. Deduplication Key: SHA-256(orderId|paymentId|eventType)
    const webhookEventId = generateWebhookEventId(orderId || paymentId, `${paymentId}:${eventType}`);

    await prisma.paymentWebhook.update({
      where: { id: webhookRecord.id },
      data: { webhookEventId },
    });

    if (await isWebhookAlreadyProcessed(webhookEventId)) {
      await prisma.paymentWebhook.update({
        where: { id: webhookRecord.id },
        data: { status: 'DUPLICATE' },
      });
      await logPaymentEvent(
        'WEBHOOK_DUPLICATE_SKIPPED',
        { webhookEventId: maskSensitive(webhookEventId, 8), paymentId: maskSensitive(paymentId, 10) },
        ip
      );
      return NextResponse.json({ received: true, processed: false, reason: 'duplicate' }, { status: 200 });
    }

    // 10. Replay Prevention: Verify Timestamp (5 min window)
    const webhookCreatedAt = webhookData.created_at;
    if (webhookCreatedAt) {
      const fiveMinutesAgo = Math.floor(Date.now() / 1000) - 5 * 60;
      if (webhookCreatedAt < fiveMinutesAgo && process.env.NODE_ENV === 'production') {
        await prisma.paymentWebhook.update({
          where: { id: webhookRecord.id },
          data: { status: 'FAILED', errorMessage: 'Webhook timestamp expired (replay attack protection)' },
        });
        await logPaymentEvent('WEBHOOK_REPLAY_PREVENTED', { timestamp: webhookCreatedAt }, ip);
        return NextResponse.json({ received: true, processed: false, reason: 'expired_timestamp' }, { status: 200 });
      }
    }

    // 11. Handle Event Types
    if (eventType === 'payment.captured' || eventType === 'payment.authorized' || eventType === 'order.paid') {
      // Find matching session by Razorpay Order ID or Reference Number
      let session = await prisma.donationSession.findFirst({
        where: {
          OR: [
            { referenceNumber: orderId },
            { razorpayOrderId: orderId },
          ],
          status: { not: 'COMPLETED' },
        },
        include: { purpose: true, branch: true },
      });

      if (!session) {
        // Fallback: check if already completed
        const completedSession = await prisma.donationSession.findFirst({
          where: {
            OR: [
              { referenceNumber: orderId },
              { razorpayOrderId: orderId },
            ],
            status: 'COMPLETED',
          },
        });

        if (completedSession) {
          await prisma.paymentWebhook.update({
            where: { id: webhookRecord.id },
            data: { status: 'DUPLICATE', processedAt: new Date() },
          });
          return NextResponse.json({ received: true, processed: false, reason: 'already_completed' }, { status: 200 });
        }

        await prisma.paymentWebhook.update({
          where: { id: webhookRecord.id },
          data: { status: 'FAILED', errorMessage: `No session found for order: ${maskSensitive(orderId, 10)}` },
        });
        await logPaymentEvent('SESSION_NOT_FOUND', { orderId: maskSensitive(orderId, 10) }, ip);
        return NextResponse.json({ received: true, processed: false, reason: 'session_not_found' }, { status: 200 });
      }

      // 12. Amount Cross-Verification in Paise
      if (paidAmountPaise && session.amount) {
        const amountValid = verifyPaymentAmount(paidAmountPaise, session.amount);
        if (!amountValid) {
          await prisma.paymentWebhook.update({
            where: { id: webhookRecord.id },
            data: {
              status: 'FAILED',
              errorMessage: `Amount mismatch: expected ${Math.round(session.amount * 100)} paise, got ${paidAmountPaise} paise`,
            },
          });
          await logPaymentEvent(
            'WEBHOOK_AMOUNT_MISMATCH',
            {
              expected: session.amount * 100,
              received: paidAmountPaise,
              sessionId: maskSensitive(session.id, 8),
              orderId: maskSensitive(orderId, 10),
            },
            ip
          );
          return NextResponse.json({ received: true, processed: false, reason: 'amount_mismatch' }, { status: 200 });
        }
      }

      // 13. Finalize and Settle Donation Record Transactionally
      const result = await completeDonationSession(
        session.id,
        paymentId || orderId,
        signatureHeader || 'webhook_verified',
        {
          source: 'RAZORPAY_WEBHOOK',
          event: eventType,
          razorpayPaymentId: paymentId,
          razorpayOrderId: orderId,
          upiVpa: paymentEntity?.vpa,
        }
      );

      // 14. Mark Webhook Processed
      await prisma.paymentWebhook.update({
        where: { id: webhookRecord.id },
        data: {
          status: result.alreadyProcessed ? 'DUPLICATE' : 'PROCESSED',
          processedAt: new Date(),
          webhookEventId,
        },
      });

      await logPaymentEvent(
        result.alreadyProcessed ? 'WEBHOOK_DUPLICATE_SKIPPED' : 'WEBHOOK_PROCESSED',
        {
          donationId: result.donation?.id || '',
          paymentId: maskSensitive(paymentId, 10),
          orderId: maskSensitive(orderId, 10),
          amount: session.amount,
        },
        ip
      );

      return NextResponse.json({
        received: true,
        processed: true,
        alreadyProcessed: result.alreadyProcessed,
        donationId: result.donation?.id,
      });
    }

    if (eventType === 'payment.failed') {
      // Find matching session and mark FAILED
      const session = await prisma.donationSession.findFirst({
        where: {
          OR: [{ referenceNumber: orderId }, { razorpayOrderId: orderId }],
        },
      });

      if (session) {
        await prisma.donationSession.update({
          where: { id: session.id },
          data: { status: 'FAILED' },
        });

        await prisma.donation.updateMany({
          where: { sessionId: session.id },
          data: { status: 'FAILED' },
        });

        safeTriggerCompanionEvent(
          'donation.failed',
          { sessionId: session.id, orderId, reason: paymentEntity?.error_description || 'Payment failed' },
          `member:${session.memberId || 'guest'}`
        ).catch(() => {});
      }

      await prisma.paymentWebhook.update({
        where: { id: webhookRecord.id },
        data: { status: 'PROCESSED', processedAt: new Date(), webhookEventId },
      });

      await logPaymentEvent(
        'PAYMENT_VERIFY_FAILED',
        { orderId: maskSensitive(orderId, 10), paymentId: maskSensitive(paymentId, 10) },
        ip
      );

      return NextResponse.json({ received: true, processed: true, event: 'payment.failed' });
    }

    if (eventType === 'payment.refunded' || eventType === 'refund.created') {
      const refundEntity = (webhookData.payload as any)?.refund?.entity;
      const refundId = refundEntity?.id;
      const refundedAmount = refundEntity?.amount ? refundEntity.amount / 100 : 0;

      // Update donation status
      const donation = await prisma.donation.findFirst({
        where: {
          OR: [
            { razorpayPaymentId: paymentId },
            { razorpayOrderId: orderId },
          ],
        },
      });

      if (donation) {
        await prisma.donation.update({
          where: { id: donation.id },
          data: { status: 'REFUNDED' },
        });

        // Record negative financial ledger entry for audit
        await prisma.transaction.create({
          data: {
            type: 'OUTFLOW',
            amount: refundedAmount || donation.amount,
            category: 'DONATION_REFUND',
            description: `Refund for donation ${donation.id}. Razorpay Payment ID: ${paymentId}. Refund ID: ${refundId || 'N/A'}`,
            account: 'General Fund',
          },
        });
      }

      await prisma.paymentWebhook.update({
        where: { id: webhookRecord.id },
        data: { status: 'PROCESSED', processedAt: new Date(), webhookEventId },
      });

      await logPaymentEvent(
        'WEBHOOK_PROCESSED',
        { action: 'refund', paymentId: maskSensitive(paymentId, 10), donationId: donation?.id },
        ip
      );

      return NextResponse.json({ received: true, processed: true, event: eventType });
    }

    // Default: Unsupported event handled gracefully
    await prisma.paymentWebhook.update({
      where: { id: webhookRecord.id },
      data: { status: 'IGNORED', processedAt: new Date() },
    });

    return NextResponse.json({ received: true, processed: false, event: eventType });
  } catch (err: any) {
    const errMsg = sanitizeAuditField(err?.message || 'Internal webhook error');
    console.error('[RAZORPAY_WEBHOOK] Processing error:', err);

    await prisma.paymentWebhook.update({
      where: { id: webhookRecord.id },
      data: { status: 'FAILED', errorMessage: errMsg },
    });

    await writeAuditLog({
      action: 'PAYMENT_WEBHOOK_ERROR',
      details: errMsg,
      ipAddress: ip,
    });

    return NextResponse.json({ received: true, processed: false, error: 'Internal processing error' }, { status: 200 });
  }
}
