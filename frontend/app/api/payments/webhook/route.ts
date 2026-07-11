import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyWebhookSignature } from '@/lib/security';
import { writeAuditLog } from '@/lib/auditLogger';
import { completeDonationSession } from '@/lib/paymentService';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';
  const rawBody = await req.text();
  const signatureHeader = req.headers.get('x-webhook-signature');

  // 1. Audit Webhook Request
  const webhookRecord = await prisma.paymentWebhook.create({
    data: {
      payload: JSON.parse(rawBody || '{}'),
      signature: signatureHeader || null,
      ipAddress: ip,
      status: 'PENDING',
    },
  });

  try {
    // 2. Cryptographic Signature Validation
    const webhookSecret = process.env.PAYMENT_WEBHOOK_SECRET || 'kcm_webhook_local_secret';
    const isProd = process.env.NODE_ENV === 'production';
    const isSignatureValid = verifyWebhookSignature(rawBody, signatureHeader, webhookSecret);

    if (isProd && !isSignatureValid) {
      await prisma.paymentWebhook.update({
        where: { id: webhookRecord.id },
        data: { status: 'INVALID', errorMessage: 'Signature mismatch' },
      });
      await writeAuditLog({
        action: 'WEBHOOK_SIGNATURE_FAILED',
        details: `Invalid webhook signature header: ${signatureHeader} from IP: ${ip}`,
        ipAddress: ip,
      });
      return NextResponse.json({ error: 'Invalid webhook signature.' }, { status: 400 });
    }

    // 3. Process Webhook Payload
    const payload = JSON.parse(rawBody);
    const { event, sessionId, amount, utr, signature, timestamp } = payload;

    if (event !== 'payment.success') {
      await prisma.paymentWebhook.update({
        where: { id: webhookRecord.id },
        data: { status: 'PROCESSED' },
      });
      return NextResponse.json({ message: 'Webhook event ignored (only success processed).' });
    }

    // Prevent Replay Attacks: Check if webhook payload is older than 15 minutes
    const fifteenMinutesAgo = Date.now() - 15 * 60 * 1000;
    if (timestamp < fifteenMinutesAgo) {
      await prisma.paymentWebhook.update({
        where: { id: webhookRecord.id },
        data: { status: 'FAILED', errorMessage: 'Payload expired / Replay protection triggered' },
      });
      await writeAuditLog({
        action: 'WEBHOOK_REPLAY_ATTACK_PREVENTED',
        details: `Expired webhook timestamp detected: ${timestamp}`,
        ipAddress: ip,
      });
      return NextResponse.json({ error: 'Payload expired' }, { status: 400 });
    }

    // 4. Complete payment using service helper
    const result = await completeDonationSession(sessionId, utr, signature || 'webhook_signature', payload);

    // Update webhook audit log as processed
    await prisma.paymentWebhook.update({
      where: { id: webhookRecord.id },
      data: { status: 'PROCESSED', processedAt: new Date() },
    });

    return NextResponse.json({
      success: true,
      message: 'Webhook processed successfully.',
      alreadyProcessed: result.alreadyProcessed,
      donationId: result.donation?.id,
    });
  } catch (err: any) {
    console.error('[API/PAYMENTS/WEBHOOK] Error:', err);
    await prisma.paymentWebhook.update({
      where: { id: webhookRecord.id },
      data: { status: 'FAILED', errorMessage: err.message || 'Internal Webhook Processing Error' },
    });
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
