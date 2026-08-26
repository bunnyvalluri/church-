/**
 * KCM Donation Notification Orchestrator
 * ─────────────────────────────────────────────────────────────────────────────
 * Dispatches notifications across all channels after a successful donation:
 *   • SMS (Twilio / MSG91 / Fast2SMS stub — activate via env vars)
 *   • WhatsApp (Twilio WhatsApp API stub — activate via env vars)
 *   • Email (Resend — premium branded HTML with full receipt details)
 *   • Push (Firebase — already in paymentService, re-exported here)
 *   • Admin Alerts (in-app + socket + push to ADMIN / SUPER_ADMIN / PASTOR)
 *
 * Every channel writes a NotificationLog row for audit & retry tracking.
 * Failures are caught individually — one channel failing never blocks others.
 */

import { prisma } from '@/lib/prisma';
import { sendPushNotification } from '@/lib/firebaseAdmin';
import { safeTriggerCompanionEvent } from '@/lib/socketTrigger';
import { emailService } from '@/lib/email';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface DonationNotificationPayload {
  // Donation identifiers
  donationId: string;
  receiptId: string;
  receiptNumber: string;
  verificationCode: string;

  // Donor info
  donorName: string;
  donorEmail: string;
  donorPhone: string;
  isAnonymous?: boolean;
  memberId?: string | null;

  // Donation details
  amount: number;
  currency: string;
  purpose: string;       // human-readable e.g. "Church Building Fund"
  purposeCode: string;   // machine code e.g. "BUILDING_FUND"
  branchName: string;
  campaignName?: string;
  paymentMethod: string; // "UPI"
  upiApp?: string;       // "GPay" / "PhonePe" / "Paytm" / "BHIM" / "UPI"
  utr: string;           // UTR / transaction reference
  razorpayPaymentId?: string;

  // Dates
  paidAt: Date;

  // URLs
  receiptUrl: string;    // Full URL to receipt page
  pdfUrl?: string;       // Full URL to PDF download
  verifyUrl: string;     // Full URL to verify receipt
}

// ─── Notification Channel Logger ─────────────────────────────────────────────

async function logNotification(
  channel: string,
  status: 'SENT' | 'FAILED' | 'SKIPPED' | 'RETRYING',
  payload: DonationNotificationPayload,
  recipientAddr?: string,
  errorMessage?: string,
  retryCount = 0
): Promise<string> {
  try {
    const log = await prisma.notificationLog.create({
      data: {
        donationId: payload.donationId,
        receiptId: payload.receiptId,
        receiptNumber: payload.receiptNumber,
        channel,
        status,
        recipient_addr: recipientAddr || undefined,
        retryCount,
        deliveredAt: status === 'SENT' ? new Date() : undefined,
        errorMessage: errorMessage || undefined,
      },
    });
    return log.id;
  } catch (err) {
    console.error(`[NOTIF_LOG] Failed to write ${channel} log:`, err);
    return '';
  }
}

// ─── SMS Notification ─────────────────────────────────────────────────────────

export async function sendDonationSms(payload: DonationNotificationPayload): Promise<boolean> {
  const phone = payload.donorPhone;
  if (!phone || payload.isAnonymous) {
    await logNotification('SMS', 'SKIPPED', payload, phone, 'No phone or anonymous donor');
    return false;
  }

  const message = `Dear ${payload.donorName},\n\nThank you for your donation of ₹${payload.amount.toLocaleString('en-IN')} to Kingdom of Christ Ministries.\n\nReceipt: ${payload.receiptNumber}\nRef: ${payload.utr}\n\nVerify: ${payload.verifyUrl}\n\nGod bless you. 🙏\n— KCM`;

  // ── Twilio SMS (activate by setting TWILIO_ACCOUNT_SID + TWILIO_AUTH_TOKEN + TWILIO_PHONE) ──
  const twilioSid = process.env.TWILIO_ACCOUNT_SID;
  const twilioToken = process.env.TWILIO_AUTH_TOKEN;
  const twilioPhone = process.env.TWILIO_PHONE_NUMBER;

  if (twilioSid && twilioToken && twilioPhone) {
    try {
      const formattedPhone = phone.startsWith('+') ? phone : `+91${phone.replace(/^0/, '')}`;
      const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${twilioSid}/Messages.json`;
      const auth = Buffer.from(`${twilioSid}:${twilioToken}`).toString('base64');

      const res = await fetch(twilioUrl, {
        method: 'POST',
        headers: {
          Authorization: `Basic ${auth}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          From: twilioPhone,
          To: formattedPhone,
          Body: message,
        }).toString(),
      });

      if (res.ok) {
        await logNotification('SMS', 'SENT', payload, formattedPhone);
        console.info(`[NOTIF/SMS] Sent to ${formattedPhone}`);
        return true;
      } else {
        const errBody = await res.text();
        throw new Error(`Twilio response: ${res.status} — ${errBody}`);
      }
    } catch (err: any) {
      await logNotification('SMS', 'FAILED', payload, phone, err.message);
      console.error('[NOTIF/SMS] Twilio dispatch failed:', err.message);
      return false;
    }
  }

  // ── MSG91 SMS (activate by setting MSG91_AUTH_KEY + MSG91_SENDER) ──
  const msg91Key = process.env.MSG91_AUTH_KEY;
  const msg91Sender = process.env.MSG91_SENDER_ID || 'KCMHYD';

  if (msg91Key) {
    try {
      const formattedPhone = phone.replace(/\D/g, '').slice(-10);
      const res = await fetch('https://api.msg91.com/api/v5/flow/', {
        method: 'POST',
        headers: {
          authkey: msg91Key,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          template_id: process.env.MSG91_TEMPLATE_ID || '',
          short_url: '0',
          recipients: [
            {
              mobiles: `91${formattedPhone}`,
              name: payload.donorName,
              amount: `₹${payload.amount.toLocaleString('en-IN')}`,
              receipt: payload.receiptNumber,
              utr: payload.utr,
            },
          ],
        }),
      });

      if (res.ok) {
        await logNotification('SMS', 'SENT', payload, formattedPhone);
        console.info(`[NOTIF/SMS] MSG91 sent to ${formattedPhone}`);
        return true;
      }
      throw new Error(`MSG91 error: ${res.status}`);
    } catch (err: any) {
      await logNotification('SMS', 'FAILED', payload, phone, err.message);
      console.error('[NOTIF/SMS] MSG91 dispatch failed:', err.message);
      return false;
    }
  }

  // ── Stub — log as SKIPPED if no provider configured ──
  await logNotification('SMS', 'SKIPPED', payload, phone, 'No SMS provider configured. Set TWILIO_* or MSG91_* env vars.');
  console.info('[NOTIF/SMS] Skipped — no provider configured');
  return false;
}

// ─── WhatsApp Notification ────────────────────────────────────────────────────

export async function sendDonationWhatsApp(payload: DonationNotificationPayload): Promise<boolean> {
  const phone = payload.donorPhone;
  if (!phone || payload.isAnonymous) {
    await logNotification('WHATSAPP', 'SKIPPED', payload, phone, 'No phone or anonymous donor');
    return false;
  }

  // ── Twilio WhatsApp (activate: TWILIO_WHATSAPP_FROM e.g. whatsapp:+14155238886) ──
  const twilioSid = process.env.TWILIO_ACCOUNT_SID;
  const twilioToken = process.env.TWILIO_AUTH_TOKEN;
  const twilioWaFrom = process.env.TWILIO_WHATSAPP_FROM;

  if (twilioSid && twilioToken && twilioWaFrom) {
    try {
      const formattedPhone = phone.startsWith('+') ? phone : `+91${phone.replace(/^0/, '')}`;
      const waBody = `✝ *Kingdom of Christ Ministries*\n\nDear *${payload.donorName}*, God bless you! 🙏\n\nYour generous donation has been received:\n\n💰 *Amount:* ₹${payload.amount.toLocaleString('en-IN')}\n📋 *Receipt:* ${payload.receiptNumber}\n🎯 *Cause:* ${payload.purpose}\n🏛 *Branch:* ${payload.branchName}\n🔗 *UTR Ref:* ${payload.utr}\n\n📄 *Download Receipt:* ${payload.receiptUrl}\n✅ *Verify:* ${payload.verifyUrl}\n\n_"For God so loved the world..." — John 3:16_\n\nFor support: +91 97040 90069`;

      const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${twilioSid}/Messages.json`;
      const auth = Buffer.from(`${twilioSid}:${twilioToken}`).toString('base64');

      const res = await fetch(twilioUrl, {
        method: 'POST',
        headers: {
          Authorization: `Basic ${auth}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          From: twilioWaFrom,
          To: `whatsapp:${formattedPhone}`,
          Body: waBody,
        }).toString(),
      });

      if (res.ok) {
        await logNotification('WHATSAPP', 'SENT', payload, formattedPhone);
        console.info(`[NOTIF/WHATSAPP] Sent to ${formattedPhone}`);
        return true;
      }
      const errBody = await res.text();
      throw new Error(`Twilio WA: ${res.status} — ${errBody}`);
    } catch (err: any) {
      await logNotification('WHATSAPP', 'FAILED', payload, phone, err.message);
      console.error('[NOTIF/WHATSAPP] Twilio dispatch failed:', err.message);
      return false;
    }
  }

  // ── Meta Cloud API (activate: META_WA_TOKEN + META_WA_PHONE_NUMBER_ID) ──
  const metaToken = process.env.META_WA_ACCESS_TOKEN;
  const metaPhoneId = process.env.META_WA_PHONE_NUMBER_ID;

  if (metaToken && metaPhoneId) {
    try {
      const formattedPhone = phone.replace(/\D/g, '').startsWith('91')
        ? phone.replace(/\D/g, '')
        : `91${phone.replace(/\D/g, '').slice(-10)}`;

      const res = await fetch(`https://graph.facebook.com/v19.0/${metaPhoneId}/messages`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${metaToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          to: formattedPhone,
          type: 'text',
          text: {
            body: `✝ Kingdom of Christ Ministries\n\nDear ${payload.donorName}, thank you! 🙏\n\nAmount: ₹${payload.amount.toLocaleString('en-IN')}\nReceipt: ${payload.receiptNumber}\nCause: ${payload.purpose}\n\nReceipt: ${payload.receiptUrl}\n\nGod bless you!`,
          },
        }),
      });

      if (res.ok) {
        await logNotification('WHATSAPP', 'SENT', payload, formattedPhone);
        return true;
      }
      throw new Error(`Meta WA API: ${res.status}`);
    } catch (err: any) {
      await logNotification('WHATSAPP', 'FAILED', payload, phone, err.message);
      console.error('[NOTIF/WHATSAPP] Meta dispatch failed:', err.message);
      return false;
    }
  }

  await logNotification('WHATSAPP', 'SKIPPED', payload, phone, 'No WhatsApp provider configured. Set TWILIO_WHATSAPP_FROM or META_WA_* env vars.');
  console.info('[NOTIF/WHATSAPP] Skipped — no provider configured');
  return false;
}

// ─── Premium Email Notification ───────────────────────────────────────────────

export async function sendDonationReceiptEmail(payload: DonationNotificationPayload): Promise<boolean> {
  const email = payload.donorEmail;
  if (!email || payload.isAnonymous) {
    await logNotification('EMAIL', 'SKIPPED', payload, email, 'No email or anonymous donor');
    return false;
  }

  const formattedAmount = payload.amount.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    style: 'currency',
    currency: 'INR',
  });

  const formattedDate = new Date(payload.paidAt).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const receiptUrl = `${process.env.NEXTAUTH_URL || 'https://kcmchurch.vercel.app'}/donations/receipts/${payload.receiptId}`;
  const downloadPdfUrl = `${process.env.NEXTAUTH_URL || 'https://kcmchurch.vercel.app'}/api/receipts/${payload.receiptId}?download=true`;

  try {
    const result = await emailService.sendDonationReceipt(
      email,
      {
        email,
        donorName: payload.donorName,
        receiptNumber: payload.receiptNumber,
        donationAmount: formattedAmount,
        transactionId: payload.utr || payload.razorpayPaymentId || payload.receiptNumber,
        date: formattedDate,
        purpose: payload.purpose,
        verificationCode: payload.verificationCode,
        utr: payload.utr,
        receiptUrl,
        downloadPdfUrl: payload.pdfUrl || downloadPdfUrl,
      },
      payload.receiptId
    );

    if (result.success) {
      console.info(`[NOTIF/EMAIL] Receipt email sent to ${email} via ${result.provider}`);
      return true;
    } else {
      console.warn(`[NOTIF/EMAIL] Receipt email delivery warning: ${result.error}`);
      return false;
    }
  } catch (err: any) {
    console.error('[NOTIF/EMAIL] Dispatch exception:', err?.message);
    return false;
  }
}

// ─── Admin Team Alerts ────────────────────────────────────────────────────────

export async function notifyAdminTeam(payload: DonationNotificationPayload): Promise<void> {
  const adminRoles = ['ADMIN', 'SUPER_ADMIN', 'PASTOR', 'BRANCH_MANAGER', 'FINANCE'];
  const formattedAmount = `₹${payload.amount.toLocaleString('en-IN')}`;

  try {
    // 1. Create in-app notification for each admin role
    const adminNotificationTitle = `💰 New Donation Received — ${formattedAmount}`;
    const adminNotificationContent = `${payload.isAnonymous ? 'An anonymous donor' : payload.donorName} donated ${formattedAmount} for ${payload.purpose} (Branch: ${payload.branchName}). Receipt: ${payload.receiptNumber}`;

    await prisma.notification.create({
      data: {
        type: 'DONATION',
        title: adminNotificationTitle,
        content: adminNotificationContent,
        link: `/admin/donations/${payload.donationId}`,
      },
    });

    // 2. Emit socket events to admin rooms
    await safeTriggerCompanionEvent(
      'admin.donation.received',
      {
        donationId: payload.donationId,
        receiptNumber: payload.receiptNumber,
        donorName: payload.isAnonymous ? 'Anonymous' : payload.donorName,
        amount: payload.amount,
        purpose: payload.purpose,
        branchName: payload.branchName,
        utr: payload.utr,
        paidAt: payload.paidAt.toISOString(),
        receiptUrl: payload.receiptUrl,
      },
      'admin:dashboard'
    );

    await safeTriggerCompanionEvent(
      'finance.donation.received',
      { amount: payload.amount, receiptNumber: payload.receiptNumber, donationId: payload.donationId },
      'admin:finance'
    );

    // 3. Send push notifications to all admin device tokens
    const adminDeviceTokens = await prisma.deviceToken.findMany({
      where: {
        user: {
          role: { in: adminRoles as any[] },
        },
      },
      select: { token: true },
    });

    const adminTokens = adminDeviceTokens.map((d) => d.token);
    if (adminTokens.length > 0) {
      await sendPushNotification(
        adminTokens,
        `💰 New Donation — ${formattedAmount}`,
        `${payload.isAnonymous ? 'Anonymous donor' : payload.donorName} | ${payload.purpose} | ${payload.branchName}`,
        { link: `/admin/donations/${payload.donationId}`, donationId: payload.donationId }
      );
    }

    await logNotification('ADMIN_ALERT', 'SENT', payload, 'admin-team');
    console.info('[NOTIF/ADMIN] Admin team notified successfully');
  } catch (err: any) {
    await logNotification('ADMIN_ALERT', 'FAILED', payload, 'admin-team', err.message);
    console.error('[NOTIF/ADMIN] Admin alert failed:', err.message);
  }
}

// ─── Master Orchestrator ──────────────────────────────────────────────────────

/**
 * Fire all notifications for a successful donation.
 * Each channel is independent — failures are isolated and logged.
 * Returns a status summary for each channel.
 */
export async function dispatchDonationNotifications(payload: DonationNotificationPayload): Promise<{
  sms: boolean;
  whatsapp: boolean;
  email: boolean;
  adminAlert: boolean;
}> {
  console.info(`[NOTIF/DISPATCH] Starting notifications for donation ${payload.donationId}`);

  // Fire all channels concurrently — failures are isolated
  const [smsResult, whatsappResult, emailResult] = await Promise.allSettled([
    sendDonationSms(payload),
    sendDonationWhatsApp(payload),
    sendDonationReceiptEmail(payload),
  ]);

  // Admin alert runs separately (critical)
  let adminAlertResult = false;
  try {
    await notifyAdminTeam(payload);
    adminAlertResult = true;
  } catch (err) {
    console.error('[NOTIF/ADMIN] Master orchestrator admin alert failed:', err);
  }

  const results = {
    sms: smsResult.status === 'fulfilled' && smsResult.value === true,
    whatsapp: whatsappResult.status === 'fulfilled' && whatsappResult.value === true,
    email: emailResult.status === 'fulfilled' && emailResult.value === true,
    adminAlert: adminAlertResult,
  };

  console.info('[NOTIF/DISPATCH] Completed:', results);
  return results;
}

// ─── Retry Mechanism ──────────────────────────────────────────────────────────

/**
 * Retry all FAILED notification logs older than 5 minutes but less than 24 hours.
 * Called by a cron job or manually from admin panel.
 */
export async function retryFailedNotifications(): Promise<{ retried: number; succeeded: number }> {
  const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

  const failedLogs = await prisma.notificationLog.findMany({
    where: {
      status: 'FAILED',
      retryCount: { lt: 3 }, // max 3 retries
      sentAt: { gte: oneDayAgo, lte: fiveMinutesAgo },
      donationId: { not: null },
    },
    take: 50,
    orderBy: { sentAt: 'asc' },
  });

  let retried = 0;
  let succeeded = 0;

  for (const log of failedLogs) {
    if (!log.donationId) continue;

    try {
      // Mark as retrying
      await prisma.notificationLog.update({
        where: { id: log.id },
        data: { status: 'RETRYING', retryCount: log.retryCount + 1 },
      });

      // Fetch donation + receipt data
      const donation = await prisma.donation.findUnique({
        where: { id: log.donationId },
        include: { receipt: true, purposeRelation: true, branch: true },
      });

      if (!donation) {
        await prisma.notificationLog.update({
          where: { id: log.id },
          data: { status: 'FAILED', errorMessage: 'Donation not found during retry' },
        });
        continue;
      }

      const domain = process.env.NEXTAUTH_URL || 'http://localhost:3000';
      const retryPayload: DonationNotificationPayload = {
        donationId: donation.id,
        receiptId: donation.receipt?.id || '',
        receiptNumber: donation.receipt?.receiptNumber || '',
        verificationCode: donation.receipt?.verificationCode || '',
        donorName: donation.donorName || 'Beloved Donor',
        donorEmail: donation.donorEmail || '',
        donorPhone: donation.donorPhone || '',
        isAnonymous: donation.donorName === 'Anonymous Giver',
        memberId: donation.userId,
        amount: donation.amount,
        currency: donation.currency,
        purpose: donation.purposeRelation?.nameEn || donation.purpose,
        purposeCode: donation.purpose,
        branchName: donation.branch?.name || 'General',
        paymentMethod: donation.paymentMethod || 'UPI',
        utr: donation.razorpayPaymentId || '',
        razorpayPaymentId: donation.razorpayPaymentId || undefined,
        paidAt: donation.createdAt,
        receiptUrl: `${domain}/give/receipt/${donation.id}`,
        verifyUrl: `${domain}/give/receipt/${donation.id}?verify=${donation.receipt?.verificationCode}`,
      };

      let success = false;
      if (log.channel === 'SMS') success = await sendDonationSms(retryPayload);
      else if (log.channel === 'WHATSAPP') success = await sendDonationWhatsApp(retryPayload);
      else if (log.channel === 'EMAIL') success = await sendDonationReceiptEmail(retryPayload);

      if (success) {
        await prisma.notificationLog.update({
          where: { id: log.id },
          data: { status: 'SENT', deliveredAt: new Date() },
        });
        succeeded++;
      } else {
        await prisma.notificationLog.update({
          where: { id: log.id },
          data: { status: 'FAILED' },
        });
      }
      retried++;
    } catch (err: any) {
      console.error(`[NOTIF/RETRY] Error retrying log ${log.id}:`, err.message);
    }
  }

  console.info(`[NOTIF/RETRY] Retried ${retried}, Succeeded ${succeeded}`);
  return { retried, succeeded };
}
