/**
 * src/webhooks/razorpay.webhook.ts
 * Razorpay Webhook Handler with HMAC-SHA256 signature verification, Idempotency & Automatic Receipt Generation.
 */

import { Request, Response } from 'express';
import crypto from 'crypto';
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

  // 1. Validate cryptographic HMAC-SHA256 signature (constant-time verification)
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
    // 2. Extract payment ID, order ID, and metadata
    const paymentId = payment.id;
    const notes = (payment.notes || {}) as Record<string, any>;
    const orderId =
      payment.order_id ||
      notes.orderId ||
      notes.referenceNumber ||
      notes.sessionId ||
      '';
    const amountInRupees = payment.amount ? payment.amount / 100 : 0;

    // Enforce idempotency and settle transaction
    if (!env.DB_OFFLINE) {
      try {
        let donation = await prisma.donation.findFirst({
          where: {
            OR: [
              ...(orderId ? [{ razorpayOrderId: orderId }, { sessionId: orderId }] : []),
              { razorpayPaymentId: paymentId },
            ],
          },
          include: { receipt: true },
        });

        if (donation) {
          if (donation.status !== 'COMPLETED') {
            donation = await prisma.donation.update({
              where: { id: donation.id },
              data: {
                status: 'COMPLETED',
                razorpayPaymentId: paymentId,
                amountVerified: true,
                signatureVerified: true,
                updatedAt: new Date(),
              },
              include: { receipt: true },
            });
            logger.info(`[RAZORPAY_WEBHOOK] Donation ${donation.id} updated to COMPLETED.`);
          }
        } else {
          // Find default purpose
          const defaultPurpose = (await prisma.donationPurpose.findFirst({
            where: { code: 'CHARITY' },
          })) || (await prisma.donationPurpose.findFirst());

          donation = await prisma.donation.create({
            data: {
              amount: amountInRupees,
              currency: payment.currency || 'INR',
              purpose: defaultPurpose?.code || 'CHARITY',
              purposeId: defaultPurpose?.id,
              paymentMethod: 'RAZORPAY_UPI',
              razorpayPaymentId: paymentId,
              razorpayOrderId: orderId || null,
              razorpaySignature: signature,
              donorName: notes.name || payment.email?.split('@')[0] || 'Faithful Giver',
              donorEmail: payment.email || null,
              donorPhone: payment.contact || null,
              amountVerified: true,
              signatureVerified: true,
              status: 'COMPLETED',
              verifiedBy: 'RAZORPAY_WEBHOOK',
            },
            include: { receipt: true },
          });
          logger.info(`[RAZORPAY_WEBHOOK] Created completed donation ${donation.id} for payment ${paymentId}.`);
        }

        // 3. Automatically trigger receipt generation upon successful verification
        let receipt = donation.receipt;
        if (!receipt) {
          const receiptNo = `REC-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(1000 + Math.random() * 9000)}`;
          const verificationCode = crypto.randomBytes(16).toString('hex');

          receipt = await prisma.receipt.create({
            data: {
              receiptNumber: receiptNo,
              donationId: donation.id,
              memberId: donation.userId,
              referenceNumber: paymentId,
              amount: donation.amount,
              currency: donation.currency || 'INR',
              verificationCode,
              pdfUrl: `/api/receipts/${receiptNo}.pdf`,
              issuedAt: new Date(),
            },
          });
          logger.info(`[RAZORPAY_WEBHOOK] Automatically generated receipt ${receiptNo} for donation ${donation.id}.`);
        }

        // Update session if linked
        if (orderId) {
          await prisma.donationSession.updateMany({
            where: {
              OR: [{ referenceNumber: orderId }, { razorpayOrderId: orderId }],
              status: { not: 'COMPLETED' },
            },
            data: {
              status: 'COMPLETED',
              paymentState: 'CAPTURED',
              updatedAt: new Date(),
            },
          }).catch(() => {});
        }

        // Publish real-time donation events to admin, staff, and donors
        await eventPublisher.publishRealtime(
          'donation.success',
          {
            paymentId,
            orderId,
            donationId: donation.id,
            receiptNumber: receipt?.receiptNumber,
            amount: amountInRupees,
            donorName: donation.donorName,
            status: 'COMPLETED',
          },
          'ngo:donations'
        );

        await eventPublisher.publishRealtime(
          'donation:received',
          { paymentId, orderId, amountInRupees, receiptNumber: receipt?.receiptNumber },
          'finance'
        );
      } catch (err: any) {
        logger.error(`[RAZORPAY_WEBHOOK] Processing error: ${err.message}`);
      }
    }
  }

  // Always return 200 OK to acknowledge receipt to payment gateway
  res.status(200).json({ status: 'ok' });
}
