/**
 * src/webhooks/razorpay.webhook.ts
 * Razorpay Webhook Handler with HMAC-SHA256 signature verification & Idempotency.
 */

import { Request, Response } from 'express';
import { RazorpayClient } from '../infrastructure/razorpay/client';
import { prisma } from '../infrastructure/prisma/client';
import { env } from '../config/env';
import { eventPublisher } from '../application/services/eventPublisher';
import { logger } from '../shared/logger';

export async function handleRazorpayWebhook(req: Request, res: Response): Promise<void> {
  const signature = req.headers['x-razorpay-signature'] as string;
  const rawBody = (req as any).rawBody ? (req as any).rawBody.toString('utf8') : JSON.stringify(req.body);

  if (!signature) {
    logger.warn('[RAZORPAY_WEBHOOK] Rejected: Missing signature header.');
    res.status(400).json({ error: 'Missing x-razorpay-signature header' });
    return;
  }

  // 1. Validate cryptographic HMAC-SHA256 signature
  const isValid = RazorpayClient.verifyWebhookSignature(rawBody, signature);
  if (!isValid && env.IS_PROD) {
    logger.warn('[RAZORPAY_WEBHOOK] Cryptographic signature verification failed.');
    res.status(400).json({ error: 'Invalid webhook signature' });
    return;
  }

  const event = req.body?.event;
  const payment = req.body?.payload?.payment?.entity;
  logger.info(`[RAZORPAY_WEBHOOK] Received event ${event} for payment ${payment?.id}`);

  if (event === 'payment.captured' && payment) {
    const paymentId = payment.id;
    const orderId = payment.order_id;
    const amountInRupees = payment.amount / 100;

    // Enforce idempotency: check if already processed
    if (!env.DB_OFFLINE && orderId) {
      try {
        const donation = await prisma.donation.findFirst({
          where: { razorpayOrderId: orderId },
        });

        if (donation && donation.status !== 'COMPLETED') {
          await prisma.donation.update({
            where: { id: donation.id },
            data: {
              status: 'COMPLETED',
              razorpayPaymentId: paymentId,
            },
          });
          logger.info(`[RAZORPAY_WEBHOOK] Donation ${donation.id} updated to COMPLETED.`);
        }
      } catch (err: any) {
        logger.error(`[RAZORPAY_WEBHOOK] Database update error: ${err.message}`);
      }
    }

    // Publish real-time donation toast to admin and staff rooms
    await eventPublisher.publishRealtime(
      'donation:received',
      { paymentId, orderId, amountInRupees },
      'finance'
    );
  }

  // Always return 200 OK to acknowledge receipt to payment gateway
  res.status(200).json({ status: 'ok' });
}
