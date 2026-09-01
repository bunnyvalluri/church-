import { prisma } from '@/lib/prisma';
import crypto from 'crypto';
import QRCode from 'qrcode';
import { writeAuditLog } from '@/lib/auditLogger';
import { sendPushNotification } from '@/lib/firebaseAdmin';
import { safeTriggerCompanionEvent } from '@/lib/socketTrigger';
import { dispatchDonationNotifications, type DonationNotificationPayload } from '@/lib/donationNotificationService';

/**
 * Completes a donation session ATOMICALLY using a database transaction.
 * Creates payment transactions, updates donation records, issues verifiable receipts,
 * and records comprehensive audit logs.
 */
export async function completeDonationSession(
  sessionId: string,
  utr: string,
  gatewaySignature?: string,
  rawPayload?: any
) {
  // 1. Pre-fetch session and check existence
  const existingSession = await prisma.donationSession.findUnique({
    where: { id: sessionId },
    include: { purpose: true, branch: true },
  });

  if (!existingSession) {
    throw new Error(`Associated donation session ${sessionId} not found.`);
  }

  // Idempotency: skip if already completed
  if (existingSession.status === 'COMPLETED') {
    const existingDonation = await prisma.donation.findFirst({
      where: { sessionId: existingSession.id },
      include: { receipt: true },
    });
    return {
      success: true,
      alreadyProcessed: true,
      donation: existingDonation,
      receipt: existingDonation?.receipt,
    };
  }

  // Check duplicate UTR / payment ID
  const duplicateTx = await prisma.paymentTransaction.findUnique({
    where: { utr },
  });
  if (duplicateTx) {
    throw new Error(`Duplicate transaction detected for payment ID / UTR: ${utr}`);
  }

  // Resolve donor information
  let donorName = existingSession.donorName || (existingSession.memberId ? '' : 'Anonymous Giver');
  let donorEmail = existingSession.donorEmail || (existingSession.memberId ? '' : 'kingofchristministries23@gmail.com');
  let donorPhone = existingSession.donorPhone || '';

  if (existingSession.memberId && (!donorName || !donorEmail)) {
    const user = await prisma.user.findUnique({ where: { id: existingSession.memberId } });
    if (user) {
      donorName = donorName || user.name;
      donorEmail = donorEmail || user.email;
      donorPhone = donorPhone || user.phone || '';
    }
  }

  // Prepare Receipt metadata
  const receiptNumber = `REC-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(1000 + Math.random() * 9000)}`;
  const verificationCode = crypto.randomBytes(16).toString('hex');
  const domain = process.env.NEXTAUTH_URL || 'https://kcmchurch.vercel.app';

  // 2. ATOMIC DATABASE TRANSACTION
  const { donation, receipt } = await prisma.$transaction(async (tx) => {
    // a. Create Payment Transaction Record
    await tx.paymentTransaction.create({
      data: {
        sessionId: existingSession.id,
        utr,
        amount: existingSession.amount,
        currency: existingSession.currency,
        status: 'SUCCESS',
        gateway: 'RAZORPAY_UPI',
        payload: rawPayload || { source: 'VERIFICATION_SERVICE' },
        signature: gatewaySignature || 'signature_verified',
      },
    });

    // b. Update Donation Session Status
    await tx.donationSession.update({
      where: { id: existingSession.id },
      data: {
        status: 'COMPLETED',
        paymentState: 'CAPTURED',
        updatedAt: new Date(),
      },
    });

    // c. Find or Create Donation Record
    let donationRecord = await tx.donation.findFirst({
      where: { sessionId: existingSession.id },
    });

    if (donationRecord) {
      donationRecord = await tx.donation.update({
        where: { id: donationRecord.id },
        data: {
          status: 'COMPLETED',
          razorpayPaymentId: utr,
          razorpaySignature: gatewaySignature || 'signature_verified',
          amountVerified: true,
          signatureVerified: Boolean(gatewaySignature),
          verifiedBy: rawPayload?.source || 'RAZORPAY_WEBHOOK',
          updatedAt: new Date(),
        },
      });
    } else {
      donationRecord = await tx.donation.create({
        data: {
          userId: existingSession.memberId,
          amount: existingSession.amount,
          currency: existingSession.currency,
          purpose: existingSession.purpose.code,
          purposeId: existingSession.purpose.id,
          branchId: existingSession.branchId,
          sessionId: existingSession.id,
          paymentMethod: 'RAZORPAY_UPI',
          razorpayPaymentId: utr,
          razorpayOrderId: existingSession.referenceNumber,
          razorpaySignature: gatewaySignature || 'signature_verified',
          donorName,
          donorEmail,
          donorPhone,
          amountVerified: true,
          signatureVerified: Boolean(gatewaySignature),
          verifiedBy: rawPayload?.source || 'RAZORPAY_WEBHOOK',
          status: 'COMPLETED',
        },
      });
    }

    // d. Generate Verifiable Receipt QR
    const verifyUrl = `${domain}/give/receipt/${donationRecord.id}?verify=${verificationCode}`;
    const verificationQrBase64 = await QRCode.toDataURL(verifyUrl, { margin: 1, width: 200 });

    // e. Create Receipt Record
    const receiptRecord = await tx.receipt.create({
      data: {
        receiptNumber,
        donationId: donationRecord.id,
        memberId: existingSession.memberId,
        referenceNumber: utr,
        amount: existingSession.amount,
        currency: existingSession.currency,
        verificationCode,
        qrCode: verificationQrBase64,
      },
    });

    // f. Create In-App Notification
    await tx.notification.create({
      data: {
        type: 'DONATION',
        title: '🎉 Donation Verified Successfully',
        content: `Thank you ${donorName}! We received your offering of ₹${existingSession.amount.toLocaleString('en-IN')} for ${existingSession.purpose.nameEn}.`,
        link: `/give/receipt/${donationRecord.id}`,
      },
    });

    // g. Create Ledger Inflow Transaction
    await tx.transaction.create({
      data: {
        type: 'INFLOW',
        amount: existingSession.amount,
        category: `DONATION_${existingSession.purpose.code}`,
        description: `Verified online donation for ${existingSession.purpose.nameEn}. Ref: ${utr}`,
        account: 'Online Giving Gateway',
      },
    });

    return { donation: donationRecord, receipt: receiptRecord };
  });

  // 3. Post-Transaction Actions (Audit Log & Notifications)
  await writeAuditLog({
    userId: existingSession.memberId,
    action: 'DONATION_CAPTURED',
    details: `Donation session ${existingSession.id} finalized successfully. Donation ID: ${donation.id}, Payment Ref: ${utr}`,
  }).catch(() => {});

  // Realtime Socket updates
  try {
    const socketPayload = {
      type: 'donation.success',
      payload: {
        popupType: 'custom',
        title: '🎉 Donation Successful!',
        description: `Your contribution of ₹${existingSession.amount.toLocaleString('en-IN')} for ${existingSession.purpose.nameEn} is completed.`,
        icon: 'bell',
        link: `/give/receipt/${donation.id}`,
        donationId: donation.id,
        sessionId: existingSession.id,
        referenceNumber: existingSession.referenceNumber,
        amount: existingSession.amount,
        utr,
        purpose: existingSession.purpose.nameEn,
        donorName,
        createdAt: donation.createdAt,
      },
    };

    await safeTriggerCompanionEvent(
      socketPayload.type,
      socketPayload.payload,
      `member:${existingSession.memberId || 'guest'}`
    );

    await safeTriggerCompanionEvent(
      'dashboard.updated',
      { refresh: true, message: `New donation of ₹${existingSession.amount} received.` },
      'admin:dashboard'
    );
  } catch (socketErr) {
    console.warn('[PAYMENT_SERVICE] Socket emit skipped:', socketErr);
  }

  // Firebase push notifications
  try {
    const deviceTokens = await prisma.deviceToken.findMany({
      where: { userId: existingSession.memberId || undefined },
      select: { token: true },
    });
    const tokens = deviceTokens.map((d) => d.token);
    if (tokens.length > 0) {
      await sendPushNotification(
        tokens,
        'Payment Verified Successfully! 🎉',
        `Donation of ₹${existingSession.amount.toLocaleString('en-IN')} for ${existingSession.purpose.nameEn} is completed.`,
        { link: `/give/receipt/${donation.id}` }
      );
    }
  } catch (pushErr) {
    console.warn('[PAYMENT_SERVICE] Push notification dispatch failed:', pushErr);
  }

  // Dispatch email & SMS receipts in background
  const notificationPayload: DonationNotificationPayload = {
    donationId: donation.id,
    receiptId: receipt.id,
    receiptNumber,
    verificationCode,
    donorName,
    donorEmail,
    donorPhone,
    isAnonymous: !existingSession.memberId && donorName === 'Anonymous Giver',
    memberId: existingSession.memberId,
    amount: existingSession.amount,
    currency: existingSession.currency,
    purpose: existingSession.purpose.nameEn,
    purposeCode: existingSession.purpose.code,
    branchName: existingSession.branch?.name || 'General',
    paymentMethod: 'RAZORPAY_UPI',
    utr,
    razorpayPaymentId: utr,
    paidAt: donation.createdAt,
    receiptUrl: `${domain}/give/receipt/${donation.id}`,
    verifyUrl: `${domain}/give/receipt/${donation.id}?verify=${verificationCode}`,
    pdfUrl: `${domain}/api/receipts/${receipt.id}/pdf`,
  };

  dispatchDonationNotifications(notificationPayload).catch((notifErr) =>
    console.error('[PAYMENT_SERVICE] Notification dispatch error:', notifErr)
  );

  return { success: true, alreadyProcessed: false, donation, receipt };
}
