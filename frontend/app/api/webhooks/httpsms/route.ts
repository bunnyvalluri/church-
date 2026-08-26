import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';

// POST /api/webhooks/httpsms — Receive delivery updates from httpSMS
export async function POST(req: Request) {
  try {
    const rawBody = await req.text();
    let body: any = {};
    try {
      body = JSON.parse(rawBody);
    } catch {
      return NextResponse.json({ success: false, error: 'Invalid JSON payload' }, { status: 400 });
    }

    // 1. Signature / API key verification
    const webhookSecret = process.env.HTTPSMS_WEBHOOK_SECRET;
    const apiKey = process.env.HTTPSMS_API_KEY;
    const signature = req.headers.get('x-webhook-signature') || req.headers.get('x-signature-sha256');
    const headerApiKey = req.headers.get('x-api-key');

    if (webhookSecret && signature) {
      const expected = crypto.createHmac('sha256', webhookSecret).update(rawBody).digest('hex');
      if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) {
        return NextResponse.json({ success: false, error: 'Invalid webhook signature' }, { status: 401 });
      }
    } else if (apiKey && headerApiKey && headerApiKey !== apiKey) {
      return NextResponse.json({ success: false, error: 'Invalid API key' }, { status: 401 });
    }

    // 2. Extract provider message ID and status
    const data = body.data || body;
    const providerMessageId = data.id || data.messageId;
    const rawStatus = (data.status || body.type || '').toLowerCase();

    if (!providerMessageId) {
      return NextResponse.json({ success: true, message: 'Ignored payload without providerMessageId' });
    }

    let status = 'PROCESSING';
    if (rawStatus.includes('sent')) status = 'SENT';
    else if (rawStatus.includes('delivered')) status = 'DELIVERED';
    else if (rawStatus.includes('failed')) status = 'FAILED';
    else if (rawStatus.includes('expired')) status = 'EXPIRED';

    // 3. Idempotent PostgreSQL update via Prisma
    const smsModel = (prisma as any).smsMessage;
    if (smsModel) {
      const existing = await smsModel.findUnique({ where: { providerMessageId } });
      if (existing) {
        const updateData: any = { status, updatedAt: new Date() };
        if (status === 'DELIVERED') updateData.deliveredAt = new Date();
        if (status === 'FAILED') {
          updateData.failedAt = new Date();
          if (data.failureReason || data.error) updateData.failureReason = data.failureReason || data.error;
        }

        await smsModel.update({
          where: { id: existing.id },
          data: updateData,
        });

        // 4. Notify companion socket server
        const companionUrl = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001';
        fetch(`${companionUrl}/api/trigger-event`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'sms.updated',
            payload: { id: existing.id, status, providerMessageId },
          }),
        }).catch(() => {});
      }
    }

    return NextResponse.json({ success: true, received: true, status });
  } catch (err: any) {
    console.error('[WEBHOOK/HTTPSMS] Error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
