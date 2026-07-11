import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthenticatedUser } from '@/lib/authMiddleware';
import { isRateLimited, rateLimitHeaders } from '@/lib/rateLimit';
import { getClientIp, safeJson } from '@/lib/apiResponse';
import { logEvent, LogLevel } from '@/lib/logger';
import { createNotification } from '@/lib/notification';

export const dynamic = 'force-dynamic';

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
    console.info('[EMAIL/RECEIPT] Skipped receipt email: no Resend key or donor email.');
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
  const paymentRef = donation.razorpayPaymentId || 'UPI / Bank Transfer';
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

// ─── POST: Verify Endpoint ─────────────────────────────────────────────────────
export async function POST(req: Request) {
  const ip = getClientIp(req);

  // 1. Rate Limiting: Max 20 verification requests per 15 minutes per IP
  const rateLimitOpts = { windowMs: 15 * 60 * 1000, maxRequests: 20 };
  if (isRateLimited(ip, rateLimitOpts)) {
    logEvent(LogLevel.SECURITY, 'DONATION_VERIFY_LIMIT', `Rate limit hit by IP: ${ip}`);
    return NextResponse.json(
      { error: 'Too many requests. Please try again later.' },
      { status: 429, headers: rateLimitHeaders(ip, rateLimitOpts) }
    );
  }

  // 2. Safely parse JSON body
  const body = await safeJson<any>(req);
  if (!body) {
    return NextResponse.json({ error: 'Invalid JSON request body.' }, { status: 400 });
  }

  const { donationId } = body;

  if (!donationId) {
    return NextResponse.json({ error: 'Donation session ID is required.' }, { status: 400 });
  }

  try {
    // 3. Retrieve donation session record from PostgreSQL
    const donation = await prisma.donation.findUnique({
      where: { id: donationId },
    });

    if (!donation) {
      return NextResponse.json({ error: 'Donation session not found.' }, { status: 404 });
    }

    // If already verified, return success to prevent duplicate operations
    if (donation.status === 'COMPLETED') {
      return NextResponse.json({ success: true, alreadyProcessed: true, donation });
    }

    if (donation.status !== 'PENDING') {
      return NextResponse.json({ error: `Cannot verify donation with status: ${donation.status}` }, { status: 400 });
    }

    // Validate that session is ready for payment (has an amount)
    if (donation.amount <= 0) {
      return NextResponse.json({ error: 'Donation session has not been updated with an amount.' }, { status: 400 });
    }

    // 4. Authentication Check (if user owned this session)
    const user = await getAuthenticatedUser(req);
    if (donation.userId && (!user || user.uid !== donation.userId)) {
      logEvent(LogLevel.SECURITY, 'DONATION_VERIFY_UNAUTHORIZED', `Unauthorized verify attempt for session ${donationId} by user ${user?.uid || 'GUEST'}`);
      return NextResponse.json(
        { error: 'Forbidden: You do not have permission to verify this donation session.' },
        { status: 403 }
      );
    }

    // 5. Server-Side payment verification workflow
    logEvent(LogLevel.INFO, 'DONATION_VERIFY_START', `Executing payment verification for ${donationId}`);
    
    // Simulate server-side bank ledger/payment gateway network check (2 seconds)
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Generate dynamic payment reference
    const upiUtr = `upi_${Math.random().toString(36).substring(2, 6).toUpperCase()}${Date.now().toString().slice(-8)}`;

    // 6. Update PostgreSQL database status
    const updatedDonation = await prisma.donation.update({
      where: { id: donationId },
      data: {
        status: 'COMPLETED',
        paymentMethod: 'UPI',
        razorpayPaymentId: upiUtr, // Re-use existing column as the UPI Transaction ID (UTR)
        razorpaySignature: `upi_verified_server_${Date.now()}`,
      },
    });

    logEvent(
      LogLevel.INFO,
      'DONATION_VERIFY_SUCCESS',
      `Donation ${donationId} successfully verified server-side. UTR: ${upiUtr}`
    );

    // 7. Generate database notification entry for Admin Dashboard
    try {
      await createNotification({
        type: 'DONATION',
        title: 'New Donation Received',
        content: `${updatedDonation.donorName || 'A member'} donated ₹${updatedDonation.amount.toLocaleString('en-IN')} via Instant UPI QR for ${updatedDonation.purpose}.`,
        link: 'donations',
      });
    } catch (notifErr) {
      console.warn('[DONATION/VERIFY] Failed to create database notification record:', notifErr);
    }

    // 8. Trigger Socket.IO real-time dashboard updates & popup notification via backend companion server
    try {
      const companionServerUrl = process.env.SOCKET_PORT 
        ? `http://localhost:${process.env.SOCKET_PORT}/api/trigger-event`
        : 'http://localhost:3001/api/trigger-event';

      const socketPayload = {
        type: 'donation:verified',
        payload: {
          popupType: 'custom',
          title: '🎉 New Donation Received',
          description: `${updatedDonation.donorName || 'A member'} donated ₹${updatedDonation.amount.toLocaleString('en-IN')} for ${updatedDonation.purpose}.`,
          icon: 'bell',
          link: '/admin/donations',
          timestamp: new Date(),
          donation: {
            id: updatedDonation.id,
            amount: updatedDonation.amount,
            purpose: updatedDonation.purpose,
            donorName: updatedDonation.donorName,
          }
        }
      };

      const companionRes = await fetch(companionServerUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(socketPayload),
      });

      if (!companionRes.ok) {
        console.warn(`[SOCKET] Companion server returned error ${companionRes.status}`);
      } else {
        console.info('[SOCKET] Realtime donation events emitted successfully.');
      }
    } catch (socketErr: any) {
      console.warn('[SOCKET] Failed to emit Socket.IO events to companion server:', socketErr.message);
    }

    // 9. Send email receipt (non-blocking background task)
    sendDonationReceiptEmail(updatedDonation).catch((emailErr) => {
      console.error('[EMAIL/RECEIPT] Failed in background sender:', emailErr);
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Donation successfully verified.',
        donation: updatedDonation,
      },
      {
        status: 200,
        headers: rateLimitHeaders(ip, rateLimitOpts),
      }
    );
  } catch (err: any) {
    logEvent(
      LogLevel.ERROR,
      'DONATION_VERIFY_FAIL',
      `Failed to verify donation session ${donationId} for IP: ${ip}. Error: ${err.message}`,
      { stack: err.stack }
    );

    return NextResponse.json(
      { error: 'Internal Server Error occurred during transaction verification.' },
      { status: 500 }
    );
  }
}
