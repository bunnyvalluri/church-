import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

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
      console.warn('[DONATION/VERIFY] Database offline or unavailable. Using fallback JSON file. Detail:', dbError?.message || dbError);

      try {
        const fallbackFile = path.join(process.cwd(), 'prisma', 'fallback_donations.json');
        
        if (!fs.existsSync(fallbackFile)) {
          return NextResponse.json({ error: 'No donation transaction history found on fallback file storage.' }, { status: 404 });
        }

        let donations = [];
        try {
          donations = JSON.parse(fs.readFileSync(fallbackFile, 'utf-8'));
        } catch (parseErr) {
          console.error('[DONATION/VERIFY] Fallback file parsing failed, using empty list:', parseErr);
        }
        let found = false;

        donations = donations.map((donation: any) => {
          if (donation.id === donationId) {
            found = true;
            return {
              ...donation,
              status: 'COMPLETED',
              razorpayPaymentId: razorpayPaymentId || `pay_mock_${Math.random().toString(36).substring(2, 10)}`,
              razorpaySignature: razorpaySignature || 'mock_signature',
              updatedAt: new Date().toISOString(),
            };
          }
          return donation;
        });

        if (!found) {
          // If transaction was somehow not created previously, insert it now as completed
          const fallbackPaymentId = razorpayPaymentId || `pay_mock_${Math.random().toString(36).substring(2, 10)}`;
          const fallbackDonation = {
            id: donationId,
            userId: body.userId || null,
            amount: parseFloat(body.amount || '0'),
            currency: 'INR',
            purpose: body.purpose || 'GENERAL',
            paymentMethod: 'RAZORPAY',
            stripeId: null,
            razorpayOrderId: razorpayOrderId || 'mock_order_unknown',
            razorpayPaymentId: fallbackPaymentId,
            razorpaySignature: razorpaySignature || 'mock_signature',
            donorName: body.donorName || 'Member',
            donorEmail: body.donorEmail || 'member@church.org',
            donorPhone: body.donorPhone || null,
            status: 'COMPLETED' as const,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          donations.push(fallbackDonation);
          fs.writeFileSync(fallbackFile, JSON.stringify(donations, null, 2), 'utf-8');
          console.info(`[DONATION/VERIFY] ✅ Created and completed donation ${donationId} locally in fallback file.`);

          // Trigger notification
          try {
            const { createNotification } = await import('@/lib/notification');
            await createNotification({
              type: 'DONATION',
              title: 'New Donation Received',
              content: `${fallbackDonation.donorName} donated ₹${fallbackDonation.amount.toLocaleString()} for ${fallbackDonation.purpose}.`,
              link: 'donations',
            });
          } catch (notifErr) {
            console.warn('[DONATION/VERIFY/FALLBACK] Notification creation failed:', notifErr);
          }

          return NextResponse.json({ success: true, donation: fallbackDonation, warning: 'DB offline; created record in fallback.' });
        }

        fs.writeFileSync(fallbackFile, JSON.stringify(donations, null, 2), 'utf-8');
        const finalizedFallback = donations.find((d: any) => d.id === donationId);

        console.info(`[DONATION/VERIFY] ✅ Updated local fallback donation ${donationId} to COMPLETED.`);

        // Trigger notification
        try {
          const { createNotification } = await import('@/lib/notification');
          await createNotification({
            type: 'DONATION',
            title: 'New Donation Received',
            content: `${finalizedFallback.donorName || 'A member'} donated ₹${finalizedFallback.amount.toLocaleString()} for ${finalizedFallback.purpose}.`,
            link: 'donations',
          });
        } catch (notifErr) {
          console.warn('[DONATION/VERIFY/FALLBACK] Notification creation failed:', notifErr);
        }

        return NextResponse.json({
          success: true,
          donation: finalizedFallback,
          warning: 'Database offline. Local fallback file updated successfully.',
        });
      } catch (fsErr) {
        console.error('[DONATION/VERIFY] ❌ Fallback updating failed:', fsErr);
        return NextResponse.json({
          error: 'Database is offline and local fallback updating failed.',
          details: dbError?.message || String(dbError),
        }, { status: 500 });
      }
    }
  } catch (err: any) {
    console.error('[DONATION/VERIFY] Internal error:', err);
    return NextResponse.json({ error: err?.message || 'Internal Server Error' }, { status: 500 });
  }
}
