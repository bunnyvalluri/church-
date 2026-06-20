import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature, donationId } = body;

    if (!donationId) {
      return NextResponse.json({ error: 'Donation ID is required' }, { status: 400 });
    }

    const isMock = razorpayOrderId?.startsWith('order_mock_') || !razorpaySignature;
    let isValid = false;

    if (isMock) {
      console.info('[RAZORPAY/VERIFY] ℹ️ Mock verification mode triggered.');
      isValid = true;
    } else {
      // Real Razorpay Signature Verification
      try {
        const keySecret = process.env.RAZORPAY_KEY_SECRET || '';
        const generatedSignature = crypto
          .createHmac('sha256', keySecret)
          .update(`${razorpayOrderId}|${razorpayPaymentId}`)
          .digest('hex');

        isValid = generatedSignature === razorpaySignature;
      } catch (cryptoErr) {
        console.error('[RAZORPAY/VERIFY] Crypto verification error:', cryptoErr);
        isValid = false;
      }
    }

    if (!isValid) {
      console.error('[RAZORPAY/VERIFY] ❌ Cryptographic signature verification failed.');
      
      // Update donation status to FAILED in DB if possible
      try {
        await prisma.donation.update({
          where: { id: donationId },
          data: { status: 'FAILED' },
        });
      } catch {}

      return NextResponse.json({ error: 'Invalid payment signature. Verification failed.' }, { status: 400 });
    }

    console.info(`[RAZORPAY/VERIFY] ✅ Payment verified successfully for donation: ${donationId}`);

    // Update in Prisma DB
    try {
      const updatedDonation = await prisma.donation.update({
        where: { id: donationId },
        data: {
          status: 'COMPLETED',
          razorpayPaymentId: razorpayPaymentId || `pay_mock_${Math.random().toString(36).substring(2, 10)}`,
          razorpaySignature: razorpaySignature || 'mock_signature',
        },
      });

      // Trigger notification
      try {
        const { createNotification } = await import('@/lib/notification');
        await createNotification({
          type: 'DONATION',
          title: 'New Donation Received',
          content: `${updatedDonation.donorName || 'A member'} donated ₹${updatedDonation.amount.toLocaleString()} for ${updatedDonation.purpose}.`,
          link: 'donations',
        });
      } catch (notifErr) {
        console.warn('[DONATION/VERIFY] Notification creation failed:', notifErr);
      }

      return NextResponse.json({ success: true, donation: updatedDonation });
    } catch (dbError: any) {
      console.error('[DONATION/VERIFY] Database update failed:', dbError);
      return NextResponse.json(
        { error: dbError?.message || 'Database error occurred during status update' },
        { status: 500 }
      );
    }
  } catch (err: any) {
    console.error('[DONATION/VERIFY] Error:', err);
    return NextResponse.json({ error: err?.message || 'Internal Server Error' }, { status: 500 });
  }
}

