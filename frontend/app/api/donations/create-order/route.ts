import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import Razorpay from 'razorpay';

// Helper to generate a unique donation ID
function generateDonationId() {
  const timestamp = Date.now().toString(36);
  const randomStr = Math.random().toString(36).substring(2, 7);
  return `don_${timestamp}${randomStr}`;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { amount, purpose, donorName, donorEmail, donorPhone, userId, paymentMode } = body;

    if (!amount || isNaN(amount) || amount <= 0) {
      return NextResponse.json({ error: 'Valid amount is required' }, { status: 400 });
    }

    if (!purpose) {
      return NextResponse.json({ error: 'Donation purpose is required' }, { status: 400 });
    }

    if (!donorName || !donorEmail) {
      return NextResponse.json({ error: 'Donor name and email are required' }, { status: 400 });
    }

    const donationId = generateDonationId();
    const amountInINR = parseFloat(amount);
    const amountInPaise = Math.round(amountInINR * 100);
    // Determine which payment method to tag in DB
    const paymentMethod = paymentMode === 'UPI' ? 'UPI' : 'RAZORPAY';


    const razorpayKeyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || '';
    const razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET || '';

    // Initialize Razorpay
    let razorpayOrderId = `order_mock_${Math.random().toString(36).substring(2, 10)}`;
    
    // Attempt real Razorpay order creation if keys are set and not placeholders
    const hasRealKeys = razorpayKeyId && !razorpayKeyId.startsWith('rzp_test_default') && razorpayKeySecret && !razorpayKeySecret.startsWith('mock_razorpay');
    
    if (hasRealKeys) {
      try {
        const razorpayInstance = new Razorpay({
          key_id: razorpayKeyId,
          key_secret: razorpayKeySecret,
        });

        const order = await razorpayInstance.orders.create({
          amount: amountInPaise,
          currency: 'INR',
          receipt: donationId,
        });
        
        razorpayOrderId = order.id;
      } catch (rzpError) {
        console.error('[RAZORPAY] ❌ Order creation failed, falling back to mock mode:', rzpError);
        // We will proceed in mock mode to ensure local development continues smoothly
        razorpayOrderId = `order_mock_err_${Math.random().toString(36).substring(2, 10)}`;
      }
    } else {
      console.info('[RAZORPAY] ℹ️ Using mock order mode. Real Razorpay keys not provided.');
    }

    // Prepare donation record
    const donationData = {
      id: donationId,
      userId: userId || null,
      amount: amountInINR,
      currency: 'INR',
      purpose: purpose,
      paymentMethod: paymentMethod,
      stripeId: null,
      razorpayOrderId,
      razorpayPaymentId: null,
      razorpaySignature: null,
      donorName,
      donorEmail,
      donorPhone: donorPhone || null,
      status: 'PENDING' as const,
    };

    // Save to Prisma DB
    const donation = await prisma.donation.create({
      data: donationData,
    });

    return NextResponse.json({
      success: true,
      orderId: razorpayOrderId,
      amount: amountInPaise,
      currency: 'INR',
      keyId: razorpayKeyId,
      donationId: donation.id,
      isMock: !hasRealKeys,
    });
  } catch (err: any) {
    console.error('[DONATION/CREATE-ORDER] Error:', err);
    return NextResponse.json(
      { error: err?.message || 'Database error occurred while creating order' },
      { status: 500 }
    );
  }
}

