import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';

// ─── Resend Email Helper ──────────────────────────────────────────────────────
async function sendDonationReceiptEmail(donation: {
  id: string;
  donorName: string | null;
  donorEmail: string | null;
  amount: number;
  purpose: string;
  razorpayPaymentId: string | null;
  paymentMethod: string;
  createdAt: Date;
}) {
  const resendKey = process.env.RESEND_API_KEY;
  if (!resendKey || !donation.donorEmail) {
    console.info('[EMAIL/RECEIPT] Skipped: no Resend key or donor email.');
    return;
  }

  const formattedAmount = donation.amount.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
  });

  const formattedDate = new Date(donation.createdAt).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const purposeLabel = donation.purpose.replace(/_/g, ' ');
  const paymentRef = donation.razorpayPaymentId || 'UPI / Manual Transfer';
  const receiptId = donation.id.toUpperCase();

  const htmlBody = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Donation Receipt — Kingdom of Christ Ministries</title>
</head>
<body style="margin:0;padding:0;background:#f5f3ff;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f3ff;padding:32px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(124,58,237,0.08);">

        <!-- Header -->
        <tr>
          <td style="background:linear-gradient(135deg,#4f1c91,#7c3aed);padding:36px 40px;text-align:center;">
            <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:800;letter-spacing:0.5px;">
              ✝ Kingdom of Christ Ministries
            </h1>
            <p style="margin:6px 0 0;color:#c4b5fd;font-size:12px;letter-spacing:1.5px;text-transform:uppercase;">
              Official Donation Receipt
            </p>
          </td>
        </tr>

        <!-- Success Banner -->
        <tr>
          <td style="background:#f0fdf4;border-bottom:2px solid #bbf7d0;padding:20px 40px;text-align:center;">
            <p style="margin:0;font-size:28px;">🎉</p>
            <h2 style="margin:8px 0 4px;color:#15803d;font-size:18px;font-weight:700;">
              Payment Received — Thank You!
            </h2>
            <p style="margin:0;color:#166534;font-size:13px;">
              Your generous gift has been recorded and verified.
            </p>
          </td>
        </tr>

        <!-- Receipt Details -->
        <tr>
          <td style="padding:32px 40px;">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td style="padding-bottom:8px;">
                  <p style="margin:0;color:#6b7280;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px;">Receipt Number</p>
                  <p style="margin:4px 0 0;color:#1f2937;font-size:14px;font-weight:700;font-family:monospace;">${receiptId}</p>
                </td>
                <td style="padding-bottom:8px;text-align:right;">
                  <p style="margin:0;color:#6b7280;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px;">Date & Time</p>
                  <p style="margin:4px 0 0;color:#1f2937;font-size:13px;font-weight:600;">${formattedDate}</p>
                </td>
              </tr>
            </table>

            <hr style="border:none;border-top:1px solid #e5e7eb;margin:20px 0;" />

            <!-- Donor + Gift Info -->
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td width="50%" style="vertical-align:top;padding-right:16px;">
                  <p style="margin:0 0 4px;color:#7c3aed;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px;">Received From</p>
                  <p style="margin:0;color:#111827;font-size:16px;font-weight:700;">${donation.donorName || 'Anonymous Member'}</p>
                  <p style="margin:4px 0 0;color:#6b7280;font-size:13px;">${donation.donorEmail}</p>
                </td>
                <td width="50%" style="vertical-align:top;padding-left:16px;border-left:2px solid #ede9fe;">
                  <p style="margin:0 0 4px;color:#7c3aed;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px;">Purpose of Gift</p>
                  <p style="margin:0;color:#111827;font-size:16px;font-weight:700;">${purposeLabel}</p>
                  <p style="margin:4px 0 0;color:#059669;font-size:12px;font-weight:600;">✅ 80G Tax Deductible</p>
                </td>
              </tr>
            </table>

            <hr style="border:none;border-top:1px solid #e5e7eb;margin:20px 0;" />

            <!-- Amount Box -->
            <table width="100%" cellpadding="0" cellspacing="0" style="background:linear-gradient(135deg,#4f1c91,#7c3aed);border-radius:12px;">
              <tr>
                <td style="padding:24px 28px;">
                  <p style="margin:0;color:#c4b5fd;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:1px;">Amount Donated</p>
                  <p style="margin:8px 0 0;color:#ffffff;font-size:36px;font-weight:900;font-family:monospace;">₹${formattedAmount}</p>
                  <p style="margin:4px 0 0;color:#a78bfa;font-size:12px;">Payment Method: ${donation.paymentMethod}</p>
                </td>
                <td style="padding:24px 28px;text-align:right;vertical-align:middle;">
                  <p style="margin:0;color:#c4b5fd;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px;">Transaction Ref</p>
                  <p style="margin:6px 0 0;color:#ffffff;font-size:13px;font-weight:600;font-family:monospace;word-break:break-all;">${paymentRef}</p>
                </td>
              </tr>
            </table>

            <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0;" />

            <!-- 80G Statement -->
            <div style="background:#fffbeb;border:1px solid #fde68a;border-radius:10px;padding:16px 20px;">
              <p style="margin:0 0 6px;color:#92400e;font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:1px;">Tax Exemption Statement (Section 80G)</p>
              <p style="margin:0;color:#78350f;font-size:12px;line-height:1.6;">
                Donations to Kingdom of Christ Ministries are eligible for deduction under Section 80G of the Income Tax Act, 1961. This computer-generated receipt is valid for tax purposes. Please retain for your records.
              </p>
            </div>

            <p style="margin:24px 0 0;text-align:center;color:#7c3aed;font-style:italic;font-size:13px;">
              "God loves a cheerful giver." — 2 Corinthians 9:7
            </p>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background:#faf5ff;border-top:1px solid #ede9fe;padding:20px 40px;text-align:center;">
            <p style="margin:0;color:#6b7280;font-size:12px;">
              Kingdom of Christ Ministries • 15-201, Vivekananda Nagar, Jeedimetla, Hyderabad, TS 500055
            </p>
            <p style="margin:4px 0 0;color:#6b7280;font-size:12px;">
              📞 +91 97040 90069 &nbsp;|&nbsp; +91 73964 33856 &nbsp;|&nbsp; ✉ kingofchristministries23@gmail.com
            </p>
            <p style="margin:12px 0 0;color:#9ca3af;font-size:10px;">
              Questions? Reply to this email or contact us directly. This is an automated receipt.
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${resendKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'KCM Donations <donations@kingdomofchristministries.org>',
        to: [donation.donorEmail],
        subject: `Donation Receipt ₹${formattedAmount} — Kingdom of Christ Ministries`,
        html: htmlBody,
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.warn('[EMAIL/RECEIPT] Resend API error:', errText);
    } else {
      console.info(`[EMAIL/RECEIPT] ✅ Receipt sent to ${donation.donorEmail}`);
    }
  } catch (emailErr) {
    console.warn('[EMAIL/RECEIPT] Failed to send receipt email:', emailErr);
  }
}

// ─── Verify Route ─────────────────────────────────────────────────────────────
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
      const paymentId = razorpayPaymentId || `pay_upi_${Math.random().toString(36).substring(2, 10)}`;
      const signature = razorpaySignature || 'upi_verified_signature';

      const updatedDonation = await prisma.donation.update({
        where: { id: donationId },
        data: {
          status: 'COMPLETED',
          razorpayPaymentId: paymentId,
          razorpaySignature: signature,
        },
      });

      // Update associated session if exists
      if (updatedDonation.sessionId) {
        await prisma.donationSession.update({
          where: { id: updatedDonation.sessionId },
          data: { status: 'COMPLETED' },
        }).catch(() => {});
      }

      // Generate receipt record if not present
      let receipt = await prisma.receipt.findUnique({
        where: { donationId: updatedDonation.id },
      });

      if (!receipt) {
        const receiptNumber = `REC-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(1000 + Math.random() * 9000)}`;
        const verificationCode = crypto.randomBytes(16).toString('hex');
        
        receipt = await prisma.receipt.create({
          data: {
            receiptNumber,
            donationId: updatedDonation.id,
            memberId: updatedDonation.userId,
            referenceNumber: paymentId,
            amount: updatedDonation.amount,
            currency: updatedDonation.currency,
            verificationCode,
          },
        });
      }

      // Send donation receipt email (non-blocking)
      sendDonationReceiptEmail({
        id: updatedDonation.id,
        donorName: updatedDonation.donorName,
        donorEmail: updatedDonation.donorEmail,
        amount: updatedDonation.amount,
        purpose: updatedDonation.purpose,
        razorpayPaymentId: updatedDonation.razorpayPaymentId,
        paymentMethod: updatedDonation.paymentMethod,
        createdAt: updatedDonation.createdAt,
      }).catch(() => {/* already logged inside */});

      // Trigger admin notification
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

      return NextResponse.json({
        success: true,
        donation: updatedDonation,
        receiptNumber: receipt.receiptNumber,
        transactionId: paymentId,
        issuedAt: receipt.issuedAt,
      });
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


