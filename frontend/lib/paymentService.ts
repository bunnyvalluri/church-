import { prisma } from '@/lib/prisma';
import crypto from 'crypto';
import QRCode from 'qrcode';
import { writeAuditLog } from '@/lib/auditLogger';
import { sendPushNotification } from '@/lib/firebaseAdmin';
import { safeTriggerCompanionEvent } from '@/lib/socketTrigger';
import { dispatchDonationNotifications, type DonationNotificationPayload } from '@/lib/donationNotificationService';

// Notification dispatch is now handled entirely by donationNotificationService.ts
// This helper is kept as a legacy stub for any direct callers outside the main flow.
async function sendReceiptEmail(_email: string, _receiptData: any) {
  // No-op: replaced by dispatchDonationNotifications() in completeDonationSession
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

  // 10. Build notification payload and dispatch all channels concurrently
  // (domain already defined above for QR URL generation)
  const notificationPayload: DonationNotificationPayload = {
    donationId: donation.id,
    receiptId: receipt.id,
    receiptNumber,
    verificationCode,
    donorName,
    donorEmail,
    donorPhone,
    isAnonymous: !session.memberId && donorName === 'Anonymous Giver',
    memberId: session.memberId,
    amount: session.amount,
    currency: session.currency,
    purpose: session.purpose.nameEn,
    purposeCode: session.purpose.code,
    branchName: session.branch?.name || 'General',
    paymentMethod: 'UPI',
    utr,
    razorpayPaymentId: utr,
    paidAt: donation.createdAt,
    receiptUrl: `${domain}/give/receipt/${donation.id}`,
    verifyUrl: `${domain}/give/receipt/${donation.id}?verify=${verificationCode}`,
    pdfUrl: `${domain}/api/receipts/${receipt.id}/pdf`,
  };

  // Fire all notification channels in the background (non-blocking)
  dispatchDonationNotifications(notificationPayload).catch((notifErr) =>
    console.error('[PAYMENT_SERVICE] Notification dispatch error:', notifErr)
  );

  return { success: true, alreadyProcessed: false, donation, receipt };
}
