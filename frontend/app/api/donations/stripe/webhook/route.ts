import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import Stripe from 'stripe';
import { headers } from 'next/headers';

export const dynamic = 'force-dynamic';

// ── POST /api/donations/stripe/webhook ───────────────────────────────────────
// Receives and processes Stripe webhook events.
// IMPORTANT: This route must NOT use body parsing (raw body required for signature verification).
export async function POST(req: Request) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  const secretKey = process.env.STRIPE_SECRET_KEY;

  if (!webhookSecret || webhookSecret.startsWith('whsec_...') || !secretKey) {
    console.warn('[STRIPE/WEBHOOK] Not configured — ignoring webhook event.');
    return NextResponse.json({ received: true, note: 'Stripe webhooks not configured.' });
  }

  const stripe = new Stripe(secretKey, { apiVersion: '2023-10-16' });

  // Read raw body (required for signature verification)
  const rawBody = await req.text();
  const signature = req.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json({ error: 'Missing stripe-signature header' }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (err: any) {
    console.error('[STRIPE/WEBHOOK] ❌ Signature verification failed:', err?.message);
    return NextResponse.json({ error: `Webhook signature verification failed: ${err?.message}` }, { status: 400 });
  }

  console.info(`[STRIPE/WEBHOOK] ✅ Event received: ${event.type}`);

  // ── Handle specific event types ───────────────────────────────────────────
  try {
    switch (event.type) {
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        const donationId = paymentIntent.metadata?.donationId;

        if (donationId) {
          await prisma.donation.update({
            where: { id: donationId },
            data: {
              status: 'COMPLETED',
              stripeId: paymentIntent.id,
            },
          }).catch((e: any) => console.warn('[STRIPE/WEBHOOK] DB update failed (may be offline):', e?.message));

          // Trigger notification
          try {
            const { createNotification } = await import('@/lib/notification');
            await createNotification({
              type: 'DONATION',
              title: 'Stripe Payment Confirmed',
              content: `${paymentIntent.metadata?.donorName || 'A donor'} completed a ${paymentIntent.currency?.toUpperCase()} ${((paymentIntent.amount || 0) / 100).toLocaleString()} Stripe donation for ${paymentIntent.metadata?.purpose || 'General'}.`,
              link: 'donations',
            });
          } catch {}

          console.info(`[STRIPE/WEBHOOK] ✅ Donation ${donationId} marked COMPLETED.`);
        }
        break;
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        const donationId = paymentIntent.metadata?.donationId;

        if (donationId) {
          await prisma.donation.update({
            where: { id: donationId },
            data: { status: 'FAILED' },
          }).catch((e: any) => console.warn('[STRIPE/WEBHOOK] DB update failed:', e?.message));

          console.warn(`[STRIPE/WEBHOOK] ⚠️ Donation ${donationId} marked FAILED.`);
        }
        break;
      }

      case 'charge.refunded': {
        const charge = event.data.object as Stripe.Charge;
        const paymentIntentId = charge.payment_intent as string;

        if (paymentIntentId) {
          await prisma.donation.updateMany({
            where: { stripeId: paymentIntentId },
            data: { status: 'REFUNDED' },
          }).catch((e: any) => console.warn('[STRIPE/WEBHOOK] Refund DB update failed:', e?.message));

          console.info(`[STRIPE/WEBHOOK] ♻️ Donation refunded for PaymentIntent: ${paymentIntentId}`);
        }
        break;
      }

      default:
        // Ignore unhandled event types
        console.info(`[STRIPE/WEBHOOK] Unhandled event type: ${event.type}`);
    }
  } catch (handlerErr: any) {
    console.error('[STRIPE/WEBHOOK] Handler error:', handlerErr?.message || handlerErr);
    // Return 200 to prevent Stripe from retrying — the error is logged
  }

  return NextResponse.json({ received: true, type: event.type });
}
