import { prisma } from '@/lib/prisma';
import crypto from 'crypto';
import QRCode from 'qrcode';
import { writeAuditLog } from '@/lib/auditLogger';
import { sendPushNotification } from '@/lib/firebaseAdmin';
import { safeTriggerCompanionEvent } from '@/lib/socketTrigger';

// Helper to send email receipt via Resend
async function sendReceiptEmail(email: string, receiptData: any) {
  const resendKey = process.env.RESEND_API_KEY;
  if (!resendKey) {
    console.info('[PAYMENT_SERVICE] Resend API key not configured. Skipping receipt email.');
    return;
  }

  const formattedAmount = receiptData.amount.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    style: 'currency',
    currency: 'INR',
  });

  const formattedDate = new Date(receiptData.issuedAt).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const htmlBody = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 12px;">
      <h2 style="color: #4F1C91; text-align: center;">✝ Kingdom of Christ Ministries</h2>
      <p style="text-align: center; color: #6b7280; font-size: 14px;">Official Donation Receipt</p>
      <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;" />
      <p>Dear <strong>${receiptData.donorName || 'Beloved Member'}</strong>,</p>
      <p>Thank you for your generous contribution. Your gift helps us spread the Gospel and serve the community.</p>
      <div style="background-color: #faf5ff; padding: 15px; border-radius: 8px; margin: 20px 0;">
        <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
          <tr>
            <td style="padding: 6px 0; color: #6b7280;">Receipt Number:</td>
            <td style="padding: 6px 0; font-weight: bold; text-align: right;">${receiptData.receiptNumber}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #6b7280;">Verification Code:</td>
            <td style="padding: 6px 0; font-family: monospace; text-align: right;">${receiptData.verificationCode}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #6b7280;">Donation Purpose:</td>
            <td style="padding: 6px 0; text-align: right; font-weight: 600;">${receiptData.purpose}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #6b7280;">Date:</td>
            <td style="padding: 6px 0; text-align: right;">${formattedDate}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #6b7280;">Payment Method:</td>
            <td style="padding: 6px 0; text-align: right;">Instant UPI QR</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #6b7280;">Transaction Ref (UTR):</td>
            <td style="padding: 6px 0; text-align: right; font-family: monospace;">${receiptData.utr}</td>
          </tr>
          <tr style="border-top: 1px solid #ede9fe;">
            <td style="padding: 12px 0 0 0; font-size: 16px; font-weight: bold; color: #4F1C91;">Total Contribution:</td>
            <td style="padding: 12px 0 0 0; font-size: 18px; font-weight: 950; color: #4F1C91; text-align: right;">${formattedAmount}</td>
          </tr>
        </table>
      </div>
      <p style="font-size: 12px; color: #9ca3af; text-align: center; margin-top: 30px;">
        This is an automatically generated receipt. Under Section 80G of the Income Tax Act, 1961, donations to KCM are tax-exempt.
      </p>
    </div>
  `;

  try {
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${resendKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'KCM Donations <donations@kingdomofchristministries.org>',
        to: [email],
        subject: `Donation Receipt ${receiptData.receiptNumber} — KCM`,
        html: htmlBody,
      }),
    });
  } catch (emailErr) {
    console.error('[PAYMENT_SERVICE] Resend email dispatch failed:', emailErr);
  }
}

/**
 * Completes a donation session by saving payment records, receipt, creating audit log,
 * and dispatching all real-time notifications.
 */
export async function completeDonationSession(
  sessionId: string,
  utr: string,
  gatewaySignature?: string,
  rawPayload?: any
) {
  const session = await prisma.donationSession.findUnique({
    where: { id: sessionId },
    include: { purpose: true, branch: true },
  });

  if (!session) {
    throw new Error('Associated donation session not found.');
  }

  // Idempotency: skip if already completed
  if (session.status === 'COMPLETED') {
    const existingDonation = await prisma.donation.findFirst({
      where: { sessionId: session.id },
    });
    return { success: true, alreadyProcessed: true, donation: existingDonation };
  }

  // Double check UTR duplicates
  const duplicateTransaction = await prisma.paymentTransaction.findUnique({
    where: { utr },
  });
  if (duplicateTransaction) {
    throw new Error(`Duplicate transaction detected for UTR: ${utr}`);
  }

  // 1. Create Payment Transaction
  await prisma.paymentTransaction.create({
    data: {
      sessionId: session.id,
      utr,
      amount: session.amount,
      currency: session.currency,
      status: 'SUCCESS',
      gateway: 'UPI_QR',
      payload: rawPayload || { source: 'VERIFICATION_SERVICE' },
      signature: gatewaySignature || 'manual_verified',
    },
  });

  // 2. Update Session status
  await prisma.donationSession.update({
    where: { id: session.id },
    data: { status: 'COMPLETED' },
  });

  // 3. Reconcile Donor Contact info
  let donorName = session.memberId ? '' : 'Anonymous Giver';
  let donorEmail = session.memberId ? '' : 'kingofchristministries23@gmail.com';
  let donorPhone = '';

  if (session.memberId) {
    const user = await prisma.user.findUnique({ where: { id: session.memberId } });
    if (user) {
      donorName = user.name;
      donorEmail = user.email;
      donorPhone = user.phone || '';
    }
  }

  // 4. Create Donation
  const donation = await prisma.donation.create({
    data: {
      userId: session.memberId,
      amount: session.amount,
      currency: session.currency,
      purpose: session.purpose.code,
      purposeId: session.purpose.id,
      branchId: session.branchId,
      sessionId: session.id,
      paymentMethod: 'UPI',
      razorpayPaymentId: utr,
      razorpaySignature: gatewaySignature || 'upi_verified_ledger',
      donorName,
      donorEmail,
      donorPhone,
      status: 'COMPLETED',
    },
  });

  // 5. Generate secure verifiable Receipt
  const receiptNumber = `REC-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(1000 + Math.random() * 9000)}`;
  const verificationCode = crypto.randomBytes(16).toString('hex');
  
  const domain = process.env.NEXTAUTH_URL || 'http://localhost:3000';
  const verifyUrl = `${domain}/give/receipt/${donation.id}?verify=${verificationCode}`;
  const verificationQrBase64 = await QRCode.toDataURL(verifyUrl, { margin: 1, width: 200 });

  const receipt = await prisma.receipt.create({
    data: {
      receiptNumber,
      donationId: donation.id,
      memberId: session.memberId,
      referenceNumber: utr,
      amount: session.amount,
      currency: session.currency,
      verificationCode,
      qrCode: verificationQrBase64,
    },
  });

  // 6. Persist System Notification
  await prisma.notification.create({
    data: {
      type: 'DONATION',
      title: '🎉 Donation Verified Successfully',
      content: `Thank you ${donorName}! We received your offering of ₹${session.amount.toLocaleString('en-IN')} for ${session.purpose.nameEn}.`,
      link: `/give/receipt/${donation.id}`,
    },
  });

  // 7. Write Audit Log
  await writeAuditLog({
    userId: session.memberId,
    action: 'DONATION_FINALIZED',
    details: `Donation session ${session.id} finalized successfully. Donation ID: ${donation.id}, UTR: ${utr}`,
  });

  // 8. Emit Socket.IO event updates
  try {
    const socketPayload = {
      type: 'donation.success',
      payload: {
        popupType: 'custom',
        title: '🎉 Donation Successful!',
        description: `Your contribution of ₹${session.amount.toLocaleString('en-IN')} for ${session.purpose.nameEn} is completed.`,
        icon: 'bell',
        link: `/give/receipt/${donation.id}`,
        donationId: donation.id,
        sessionId: session.id,
        referenceNumber: session.referenceNumber,
        amount: session.amount,
        utr,
        purpose: session.purpose.nameEn,
        donorName,
        createdAt: donation.createdAt,
      },
    };

    // Emit to member room
    await safeTriggerCompanionEvent(
      socketPayload.type,
      socketPayload.payload,
      `member:${session.memberId || 'guest'}`
    );

    // Broadcast dashboard updates to admin
    await safeTriggerCompanionEvent(
      'dashboard.updated',
      { refresh: true, message: `New donation of ₹${session.amount} received.` },
      'admin:dashboard'
    );
  } catch (socketErr) {
    console.warn('[PAYMENT_SERVICE] Socket emit skipped:', socketErr);
  }

  // 9. Dispatch Firebase Push Notifications
  try {
    const deviceTokens = await prisma.deviceToken.findMany({
      where: { userId: session.memberId || undefined },
      select: { token: true },
    });
    const tokens = deviceTokens.map((d) => d.token);
    if (tokens.length > 0) {
      await sendPushNotification(
        tokens,
        'Payment Verified Successfully! 🎉',
        `Donation of ₹${session.amount.toLocaleString('en-IN')} for ${session.purpose.nameEn} is completed.`,
        { link: `/give/receipt/${donation.id}` }
      );
    }
  } catch (pushErr) {
    console.warn('[PAYMENT_SERVICE] Push notification dispatch failed:', pushErr);
  }

  // 10. Send Email receipt in background
  if (donorEmail) {
    sendReceiptEmail(donorEmail, {
      receiptNumber,
      verificationCode,
      amount: session.amount,
      purpose: session.purpose.nameEn,
      issuedAt: receipt.issuedAt,
      utr,
      donorName,
    }).catch((emailErr) => console.error('[PAYMENT_SERVICE] Email queue error:', emailErr));
  }

  return { success: true, alreadyProcessed: false, donation, receipt };
}
