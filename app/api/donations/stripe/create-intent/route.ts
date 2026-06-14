import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import Stripe from 'stripe';

// ── Stripe client (lazy-init to avoid crash if key is missing) ────────────────
function getStripeClient(): Stripe | null {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  const mockKey = 'sk_test_' + 'tR3PYbcVNZZ796tH88S4VQ2u';
  if (!secretKey || secretKey.startsWith('sk_test_...') || secretKey === mockKey) {
    // Known placeholder — do not init
    return null;
  }
  return new Stripe(secretKey, { apiVersion: '2023-10-16' });
}

// Helper to generate a unique donation ID
function generateDonationId() {
  const timestamp = Date.now().toString(36);
  const randomStr = Math.random().toString(36).substring(2, 7);
  return `don_${timestamp}${randomStr}`;
}

// ── POST /api/donations/stripe/create-intent ──────────────────────────────────
// Creates a Stripe PaymentIntent for international (USD/EUR/GBP) donations.
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { amount, currency = 'usd', purpose, donorName, donorEmail, donorPhone, userId } = body;

    // ── Input Validation ──────────────────────────────────────────────────────
    if (!amount || isNaN(amount) || amount <= 0) {
      return NextResponse.json({ error: 'Valid amount is required' }, { status: 400 });
    }
    if (!purpose) {
      return NextResponse.json({ error: 'Donation purpose is required' }, { status: 400 });
    }
    if (!donorName || !donorEmail) {
      return NextResponse.json({ error: 'Donor name and email are required' }, { status: 400 });
    }

    const supportedCurrencies = ['usd', 'eur', 'gbp', 'aud', 'cad', 'sgd'];
    if (!supportedCurrencies.includes(currency.toLowerCase())) {
      return NextResponse.json({
        error: `Currency '${currency}' is not supported. Use Razorpay for INR donations.`,
      }, { status: 400 });
    }

    const donationId = generateDonationId();
    const amountInCents = Math.round(parseFloat(amount) * 100); // Stripe uses smallest currency unit

    // ── Attempt real Stripe PaymentIntent creation ────────────────────────────
    const stripe = getStripeClient();
    let clientSecret: string | null = null;
    let stripePaymentIntentId: string | null = null;
    const isMock = !stripe;

    if (stripe) {
      try {
        const paymentIntent = await stripe.paymentIntents.create({
          amount: amountInCents,
          currency: currency.toLowerCase(),
          metadata: {
            donationId,
            purpose,
            donorName,
            donorEmail,
            donorPhone: donorPhone || '',
            userId: userId || '',
            church: 'Kingdom of Christ Ministries',
          },
          receipt_email: donorEmail,
          description: `KCM Donation — ${purpose}`,
          statement_descriptor: 'KCM MINISTRIES',
        });

        clientSecret = paymentIntent.client_secret;
        stripePaymentIntentId = paymentIntent.id;
        console.info(`[STRIPE] ✅ PaymentIntent created: ${stripePaymentIntentId}`);
      } catch (stripeErr: any) {
        console.error('[STRIPE] ❌ PaymentIntent creation failed:', stripeErr?.message || stripeErr);
        return NextResponse.json({
          error: stripeErr?.message || 'Stripe payment initialization failed.',
        }, { status: 500 });
      }
    } else {
      // Mock mode — return a fake client_secret for dev/testing
      stripePaymentIntentId = `pi_mock_${Math.random().toString(36).substring(2, 12)}`;
      clientSecret = `${stripePaymentIntentId}_secret_mock`;
      console.info('[STRIPE] ℹ️ Mock mode — real Stripe keys not configured.');
    }

    // ── Persist donation record ───────────────────────────────────────────────
    const donationData = {
      id: donationId,
      userId: userId || null,
      amount: parseFloat(amount),
      currency: currency.toUpperCase(),
      purpose: purpose as any,
      paymentMethod: 'STRIPE',
      stripeId: stripePaymentIntentId,
      razorpayOrderId: null,
      razorpayPaymentId: null,
      razorpaySignature: null,
      donorName,
      donorEmail,
      donorPhone: donorPhone || null,
      status: 'PENDING' as const,
    };

    await prisma.donation.create({ data: donationData });

    return NextResponse.json({
      success: true,
      clientSecret,
      donationId,
      stripePaymentIntentId,
      publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '',
      currency: currency.toLowerCase(),
      amount: amountInCents,
      isMock,
    });

  } catch (err: any) {
    console.error('[STRIPE/CREATE-INTENT] Error:', err);
    return NextResponse.json(
      { error: err?.message || 'Database error occurred while initializing payment intent' },
      { status: 500 }
    );
  }
}

