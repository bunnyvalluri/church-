import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import Stripe from 'stripe';

// ── POST /api/donations/stripe/verify ────────────────────────────────────────
// Verifies a Stripe payment after the client confirms the PaymentIntent.
// Called with: { paymentIntentId, donationId }
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { paymentIntentId, donationId } = body;

    if (!donationId) {
      return NextResponse.json({ error: 'Donation ID is required' }, { status: 400 });
    }
    if (!paymentIntentId) {
      return NextResponse.json({ error: 'Payment Intent ID is required' }, { status: 400 });
    }

    const isMock = paymentIntentId.startsWith('pi_mock_');

    // ── Mock verification ─────────────────────────────────────────────────────
    if (isMock) {
      console.info('[STRIPE/VERIFY] ℹ️ Mock verification mode.');
      return await updateDonationStatus(donationId, paymentIntentId, 'COMPLETED');
    }

    // ── Real Stripe verification ──────────────────────────────────────────────
    const secretKey = process.env.STRIPE_SECRET_KEY;
    if (!secretKey || secretKey.startsWith('sk_test_...')) {
      return NextResponse.json({ error: 'Stripe is not configured on this server.' }, { status: 503 });
    }

    const stripe = new Stripe(secretKey, { apiVersion: '2023-10-16' });

    try {
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

      if (paymentIntent.status !== 'succeeded') {
        console.warn(`[STRIPE/VERIFY] ❌ PaymentIntent ${paymentIntentId} status: ${paymentIntent.status}`);

        // Mark as failed
        await updateDonationStatus(donationId, paymentIntentId, 'FAILED');

        return NextResponse.json({
          error: `Payment not successful. Status: ${paymentIntent.status}`,
          status: paymentIntent.status,
        }, { status: 400 });
      }

      console.info(`[STRIPE/VERIFY] ✅ PaymentIntent ${paymentIntentId} confirmed as succeeded.`);
      return await updateDonationStatus(donationId, paymentIntentId, 'COMPLETED');

    } catch (stripeErr: any) {
      console.error('[STRIPE/VERIFY] Stripe API error:', stripeErr?.message || stripeErr);
      return NextResponse.json({
        error: stripeErr?.message || 'Stripe verification failed.',
      }, { status: 500 });
    }

  } catch (err: any) {
    console.error('[STRIPE/VERIFY] Internal error:', err);
    return NextResponse.json({ error: err?.message || 'Internal Server Error' }, { status: 500 });
  }
}

// ── Helper: update donation status in DB ─────────────────────────────────────
async function updateDonationStatus(
  donationId: string,
  stripePaymentIntentId: string,
  status: 'COMPLETED' | 'FAILED'
): Promise<NextResponse> {
  try {
    const updated = await prisma.donation.update({
      where: { id: donationId },
      data: { status, stripeId: stripePaymentIntentId },
    });

    if (status === 'COMPLETED') {
      try {
        const { createNotification } = await import('@/lib/notification');
        await createNotification({
          type: 'DONATION',
          title: 'New International Donation',
          content: `${updated.donorName || 'A donor'} donated ${updated.currency} ${updated.amount.toLocaleString()} via Stripe for ${updated.purpose}.`,
          link: 'donations',
        });
      } catch (notifErr) {
        console.warn('[STRIPE/VERIFY] Notification failed:', notifErr);
      }
    }

    return NextResponse.json({ success: true, donation: updated, status });
  } catch (dbError: any) {
    console.error('[STRIPE/VERIFY] Database update failed:', dbError);
    return NextResponse.json(
      { error: dbError?.message || 'Database error occurred during status update' },
      { status: 500 }
    );
  }
}

