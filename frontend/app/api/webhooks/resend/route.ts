export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { prisma } from '@/lib/prisma';
import { emailConfig } from '@/lib/email/email.config';
import { logger } from '@/lib/logger';
import { EmailDeliveryStatus } from '@/lib/email/email.types';

import { verifyResendWebhookSignature } from '@/lib/email/webhookVerifier';

export async function POST(req: Request) {
  const start = Date.now();
  const rawBody = await req.text();

  const svixId = req.headers.get('svix-id') || req.headers.get('webhook-id');
  const svixTimestamp = req.headers.get('svix-timestamp') || req.headers.get('webhook-timestamp');
  const svixSignature = req.headers.get('svix-signature') || req.headers.get('webhook-signature');

  const webhookSecret = emailConfig.providers.resend.webhookSecret;
  const isProd = emailConfig.environment.isProduction;

  // 1. Signature Verification
  let signatureVerified = false;
  if (webhookSecret) {
    signatureVerified = verifyResendWebhookSignature(
      rawBody,
      { id: svixId, timestamp: svixTimestamp, signature: svixSignature },
      webhookSecret
    );

    if (!signatureVerified) {
      logger.warn('[WEBHOOK/RESEND] Rejected webhook with invalid signature.', {
        svixId,
        hasSignature: Boolean(svixSignature),
      });
      return NextResponse.json({ error: 'Invalid webhook signature.' }, { status: 401 });
    }
  } else if (isProd) {
    logger.warn('[WEBHOOK/RESEND] RESEND_WEBHOOK_SECRET is not configured in production environment.');
    // In production, reject unsigned webhooks if secret is expected
    return NextResponse.json({ error: 'Webhook secret unconfigured.' }, { status: 401 });
  }

  // 2. Parse Payload
  let payload: any = {};
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: 'Malformed JSON payload.' }, { status: 400 });
  }

  const eventType = payload.type || 'unknown';
  const providerEventId = svixId || payload.id || `evt_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  const providerMessageId = payload.data?.email_id || payload.data?.id;

  // 3. Replay Protection & Webhook Idempotency Check
  try {
    const existingWebhook = await prisma.emailWebhookEvent.findUnique({
      where: { providerEventId },
    });

    if (existingWebhook) {
      logger.info(`[WEBHOOK/RESEND] Duplicate webhook event received (${providerEventId}). Skipped replay.`, {
        providerEventId,
        eventType,
      });
      return NextResponse.json({ success: true, status: 'DUPLICATE' });
    }
  } catch (dbErr: any) {
    logger.warn('[WEBHOOK/RESEND] Database idempotency check non-fatal note:', { error: dbErr.message });
  }

  // 4. Correlate with EmailEvent in Database
  let emailEventRecord: any = null;
  if (providerMessageId) {
    try {
      emailEventRecord = await prisma.emailEvent.findFirst({
        where: { providerMessageId },
      });
    } catch {
      /* non-blocking */
    }
  }

  // 5. Persist EmailWebhookEvent record
  try {
    await prisma.emailWebhookEvent.create({
      data: {
        emailEventId: emailEventRecord?.id || null,
        provider: 'resend',
        providerEventId,
        eventType,
        providerMessageId: providerMessageId || null,
        payload,
        signatureVerified,
        status: 'PROCESSED',
        processedAt: new Date(),
      },
    });
  } catch (createErr: any) {
    logger.error('[WEBHOOK/RESEND] Failed to record webhook event in database:', {
      error: createErr.message,
    });
  }

  // 6. Update Delivery Status based on Provider Event
  if (emailEventRecord) {
    let nextStatus: EmailDeliveryStatus | null = null;
    const now = new Date();

    switch (eventType) {
      case 'email.delivered':
        nextStatus = 'DELIVERED';
        break;
      case 'email.bounced':
        nextStatus = 'BOUNCED';
        break;
      case 'email.complained':
        nextStatus = 'BOUNCED';
        break;
      case 'email.sent':
        nextStatus = 'SENT';
        break;
      case 'email.delivery_delayed':
        nextStatus = 'RETRYING';
        break;
    }

    if (nextStatus) {
      try {
        await prisma.emailEvent.update({
          where: { id: emailEventRecord.id },
          data: {
            status: nextStatus,
            deliveredAt: nextStatus === 'DELIVERED' ? now : undefined,
            failedAt: nextStatus === 'BOUNCED' ? now : undefined,
            lastErrorCode: nextStatus === 'BOUNCED' ? 'PROVIDER_BOUNCE' : undefined,
            lastErrorMessage: payload.data?.bounce?.message || undefined,
          },
        });

        // Also update NotificationLog for backwards compatibility
        await prisma.notificationLog.updateMany({
          where: { providerMessageId },
          data: {
            status: nextStatus,
            deliveredAt: nextStatus === 'DELIVERED' ? now : undefined,
          },
        });

        logger.info(
          `[WEBHOOK/RESEND] Updated email status for ${emailEventRecord.id} to "${nextStatus}" via webhook.`,
          { eventType, providerMessageId, durationMs: Date.now() - start }
        );
      } catch (updateErr: any) {
        logger.warn('[WEBHOOK/RESEND] Failed to update email delivery status:', {
          error: updateErr.message,
        });
      }
    }
  }

  return NextResponse.json({
    success: true,
    providerEventId,
    eventType,
    status: 'PROCESSED',
  });
}
