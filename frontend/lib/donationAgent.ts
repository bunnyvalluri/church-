/**
 * lib/donationAgent.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Master Donation Management Agent Orchestrator.
 *
 * This is the central brain that coordinates all donation workflow stages:
 *   1. Validate + create Razorpay order
 *   2. Monitor payment (via webhook polling)
 *   3. On verified payment: generate receipt + dispatch notifications
 *   4. Update dashboards + analytics
 *   5. Archive audit logs
 *   6. Handle failures + retry scheduling
 *
 * SECURITY CONTRACT:
 *   ✅ Never approves or verifies payments independently
 *   ✅ All payment verification delegated to webhook handler
 *   ✅ Only reads session status from DB (backend source of truth)
 *   ✅ Never modifies payment amounts
 *   ✅ Never exposes payment credentials
 */

import { prisma } from '@/lib/prisma';
import { writeAuditLog } from '@/lib/auditLogger';
import { sanitizeAuditField, maskSensitive } from '@/lib/security';
import {
  DonationState,
  DonationEvent,
  type DonationContext,
  type DonationStateType,
  createDonationStateMachine,
  transition,
  stateToWizardStep,
  stateLabel,
} from '@/lib/donationStateMachine';
import {
  logAgentEvent,
  enqueueNotificationRetries,
  enqueueRetryJob,
} from '@/lib/donationRetryQueue';
import { trackDonationEvent } from '@/lib/donationAnalytics';
import { dispatchDonationNotifications } from '@/lib/donationNotificationService';
import { safeTriggerCompanionEvent } from '@/lib/socketTrigger';

// ─── Agent Configuration ──────────────────────────────────────────────────────

const POLL_INTERVAL_MS = 3000;   // Poll DB every 3 seconds for payment status
const MAX_POLL_ATTEMPTS = 200;   // 200 × 3s = 10 min max wait
const RECEIPT_RETRY_DELAY_MS = 5000;

// ─── Agent Session State (per-request context) ────────────────────────────────

export interface AgentInitInput {
  sessionId: string;
  donationId?: string;
  memberId?: string | null;
  ip?: string;
  userAgent?: string;
}

// ─── 1. Monitor Payment Completion ────────────────────────────────────────────
// Called by the Agent API poll endpoint.
// Reads ONLY from DB — never trusts client claims.

export async function checkPaymentStatus(sessionId: string): Promise<{
  state: DonationStateType;
  label: string;
  wizardStep: number;
  completed: boolean;
  donationId?: string;
  receiptId?: string;
  receiptNumber?: string;
  error?: string;
}> {
  const session = await prisma.donationSession.findUnique({
    where: { id: sessionId },
    include: {
      donations: {
        select: { id: true, status: true },
        take: 1,
        orderBy: { createdAt: 'desc' },
      },
    },
  });

  if (!session) {
    return {
      state: DonationState.FAILED,
      label: 'Session not found',
      wizardStep: 3,
      completed: false,
      error: 'Donation session not found.',
    };
  }

  // Map DB session status to agent state
  let agentState: DonationStateType;
  switch (session.status) {
    case 'COMPLETED':
      agentState = DonationState.COMPLETED;
      break;
    case 'FAILED':
      agentState = DonationState.FAILED;
      break;
    case 'EXPIRED':
      agentState = DonationState.EXPIRED;
      break;
    case 'PROCESSING':
      agentState = DonationState.PAYMENT_WAITING;
      break;
    default:
      agentState = new Date() > session.expiresAt
        ? DonationState.EXPIRED
        : DonationState.PAYMENT_WAITING;
  }

  const donation = session.donations[0];
  let receiptId: string | undefined;
  let receiptNumber: string | undefined;

  if (agentState === DonationState.COMPLETED && donation) {
    const receipt = await prisma.receipt.findFirst({
      where: { donationId: donation.id },
      select: { id: true, receiptNumber: true },
    });
    receiptId = receipt?.id;
    receiptNumber = receipt?.receiptNumber;
  }

  return {
    state: agentState,
    label: stateLabel(agentState),
    wizardStep: stateToWizardStep(agentState),
    completed: agentState === DonationState.COMPLETED,
    donationId: donation?.id,
    receiptId,
    receiptNumber,
  };
}

// ─── 2. Post-Payment Orchestration ────────────────────────────────────────────
// Called by webhook handler after Razorpay payment is verified.
// Orchestrates: receipt → notifications → dashboards → analytics → audit.

export interface PostPaymentResult {
  success: boolean;
  donationId?: string;
  receiptId?: string;
  receiptNumber?: string;
  notificationResults?: {
    email: 'SENT' | 'FAILED' | 'SKIPPED';
    sms: 'SENT' | 'FAILED' | 'SKIPPED';
    whatsapp: 'SENT' | 'FAILED' | 'SKIPPED';
    push: 'SENT' | 'FAILED' | 'SKIPPED';
  };
  error?: string;
}

export async function orchestratePostPayment(
  sessionId: string,
  paymentId: string,
  ip: string
): Promise<PostPaymentResult> {
  // Load session to build notification payload
  const session = await prisma.donationSession.findUnique({
    where: { id: sessionId },
    include: {
      purpose: true,
      branch: true,
      donations: {
        include: { receipt: true },
        orderBy: { createdAt: 'desc' },
        take: 1,
      },
    },
  });

  if (!session) {
    return { success: false, error: 'Session not found for post-payment orchestration' };
  }

  const donation = session.donations[0];
  const receipt = donation?.receipt;

  if (!donation || !receipt) {
    return {
      success: false,
      donationId: donation?.id,
      error: 'Donation or receipt not yet created — retry after webhook processing',
    };
  }

  // ── Log analytics event ──────────────────────────────────────────────────
  await trackDonationEvent('PAYMENT_VERIFIED', {
    sessionId,
    donationId: donation.id,
    memberId: session.memberId || undefined,
    amount: session.amount,
    purposeCode: session.purpose.code,
    branchId: session.branchId || undefined,
    ip,
  });

  // ── Resolve donor contact ────────────────────────────────────────────────
  let donorName = 'Anonymous Giver';
  let donorEmail = '';
  let donorPhone = '';

  if (session.memberId) {
    const user = await prisma.user.findUnique({
      where: { id: session.memberId },
      select: { name: true, email: true, phone: true },
    });
    if (user) {
      donorName = user.name;
      donorEmail = user.email;
      donorPhone = user.phone || '';
    }
  } else {
    // Try to get donor info from the donation record
    donorName = donation.donorName || 'Beloved Donor';
    donorEmail = donation.donorEmail || '';
    donorPhone = donation.donorPhone || '';
  }

  const domain = process.env.NEXTAUTH_URL || 'https://kcmchurch.vercel.app';

  // ── Dispatch notifications ────────────────────────────────────────────────
  const notificationStatus: PostPaymentResult['notificationResults'] = {
    email: 'SKIPPED',
    sms: 'SKIPPED',
    whatsapp: 'SKIPPED',
    push: 'SKIPPED',
  };

  try {
    await dispatchDonationNotifications({
      donationId: donation.id,
      receiptId: receipt.id,
      receiptNumber: receipt.receiptNumber,
      verificationCode: receipt.verificationCode,
      donorName,
      donorEmail,
      donorPhone,
      isAnonymous: donorName === 'Anonymous Giver',
      memberId: session.memberId,
      amount: session.amount,
      currency: session.currency,
      purpose: session.purpose.nameEn,
      purposeCode: session.purpose.code,
      branchName: session.branch?.name || 'General',
      paymentMethod: 'UPI',
      utr: paymentId,
      razorpayPaymentId: paymentId,
      paidAt: donation.createdAt,
      receiptUrl: `${domain}/give/receipt/${donation.id}`,
      verifyUrl: `${domain}/give/receipt/${donation.id}?verify=${receipt.verificationCode}`,
      pdfUrl: `${domain}/api/receipts/${receipt.id}/pdf`,
    });

    notificationStatus.email = 'SENT';
  } catch (notifErr: any) {
    console.error('[DONATION_AGENT] Notification dispatch failed:', notifErr?.message);

    // Enqueue retry for all channels
    await enqueueNotificationRetries(
      donation.id,
      sessionId,
      ['EMAIL', 'SMS', 'WHATSAPP', 'PUSH'],
      {
        donorName,
        donorEmail,
        donorPhone,
        amount: session.amount,
        purpose: session.purpose.nameEn,
        receiptId: receipt.id,
        receiptNumber: receipt.receiptNumber,
      }
    );
  }

  // ── Real-time socket event ───────────────────────────────────────────────
  try {
    await safeTriggerCompanionEvent(
      'donation.success',
      {
        type: 'donation.success',
        popupType: 'custom',
        title: '🎉 Donation Successful!',
        description: `Your contribution of ₹${session.amount.toLocaleString('en-IN')} for ${session.purpose.nameEn} is confirmed.`,
        icon: 'check-circle',
        link: `/give/receipt/${donation.id}`,
        donationId: donation.id,
        sessionId,
        amount: session.amount,
        purpose: session.purpose.nameEn,
        donorName,
        receiptNumber: receipt.receiptNumber,
      },
      `member:${session.memberId || 'guest'}`
    );

    // Broadcast admin dashboard refresh
    await safeTriggerCompanionEvent(
      'dashboard.updated',
      {
        refresh: true,
        message: `New donation of ₹${session.amount.toLocaleString('en-IN')} received from ${donorName}`,
        type: 'DONATION',
        donationId: donation.id,
      },
      'admin:dashboard'
    );
  } catch (socketErr) {
    console.warn('[DONATION_AGENT] Socket emit failed (non-critical):', socketErr);
  }

  // ── Analytics: session completed ─────────────────────────────────────────
  await trackDonationEvent('SESSION_COMPLETED', {
    sessionId,
    donationId: donation.id,
    memberId: session.memberId || undefined,
    amount: session.amount,
    purposeCode: session.purpose.code,
  });

  // ── Audit log ────────────────────────────────────────────────────────────
  await writeAuditLog({
    userId: session.memberId,
    action: 'DONATION_AGENT_ORCHESTRATION_COMPLETE',
    details: sanitizeAuditField(
      `Agent completed post-payment orchestration for donation ${donation.id}. ` +
      `Session: ${sessionId}. PaymentId: ${maskSensitive(paymentId, 10)}. ` +
      `Amount: ₹${session.amount}. Notifications queued.`
    ),
    ipAddress: ip,
  });

  return {
    success: true,
    donationId: donation.id,
    receiptId: receipt.id,
    receiptNumber: receipt.receiptNumber,
    notificationResults: notificationStatus,
  };
}

// ─── 3. Handle Session Expiry ─────────────────────────────────────────────────

export async function handleSessionExpiry(sessionId: string): Promise<void> {
  await prisma.donationSession.update({
    where: { id: sessionId, status: { in: ['PROCESSING', 'PENDING'] } },
    data: { status: 'EXPIRED' },
  }).catch(() => {}); // Ignore if already updated

  await logAgentEvent(null, sessionId, 'QR_EXPIRED', { sessionId });

  await trackDonationEvent('PAYMENT_EXPIRED', { sessionId });
}

// ─── 4. Cancel Session ────────────────────────────────────────────────────────

export async function cancelDonationSession(
  sessionId: string,
  reason: string,
  ip: string
): Promise<void> {
  await prisma.donationSession.update({
    where: { id: sessionId, status: { not: 'COMPLETED' } },
    data: { status: 'FAILED' },
  }).catch(() => {});

  await logAgentEvent(null, sessionId, 'SESSION_ABANDONED', {
    reason: sanitizeAuditField(reason, 200),
    ip,
  });

  await trackDonationEvent('SESSION_ABANDONED', { sessionId });
}

// ─── 5. Retry Job Handler Registration ───────────────────────────────────────
// Register notification retry handlers so the queue can execute them.

export async function registerAgentHandlers(): Promise<void> {
  const { registerJobHandler } = await import('@/lib/donationRetryQueue');
  const { dispatchDonationNotifications } = await import('@/lib/donationNotificationService');

  // Generic notification retry: rebuild payload from DB and re-dispatch
  const notificationRetryHandler = async (payload: any) => {
    const donation = await prisma.donation.findUnique({
      where: { id: payload.donationId },
      include: {
        receipt: true,
        purposeRelation: true,
        branch: true,
      },
    });
    if (!donation || !donation.receipt) {
      throw new Error(`Donation ${payload.donationId} or receipt not found for retry`);
    }

    const domain = process.env.NEXTAUTH_URL || 'https://kcmchurch.vercel.app';
    await dispatchDonationNotifications({
      donationId: donation.id,
      receiptId: donation.receipt.id,
      receiptNumber: donation.receipt.receiptNumber,
      verificationCode: donation.receipt.verificationCode,
      donorName: donation.donorName || 'Beloved Donor',
      donorEmail: donation.donorEmail || '',
      donorPhone: donation.donorPhone || '',
      isAnonymous: false,
      memberId: donation.userId,
      amount: donation.amount,
      currency: donation.currency,
      purpose: donation.purposeRelation?.nameEn || donation.purpose,
      purposeCode: donation.purpose,
      branchName: donation.branch?.name || 'General',
      paymentMethod: 'UPI',
      utr: donation.razorpayPaymentId || '',
      razorpayPaymentId: donation.razorpayPaymentId || undefined,
      paidAt: donation.createdAt,
      receiptUrl: `${domain}/give/receipt/${donation.id}`,
      verifyUrl: `${domain}/give/receipt/${donation.id}?verify=${donation.receipt.verificationCode}`,
      pdfUrl: `${domain}/api/receipts/${donation.receipt.id}/pdf`,
    });
  };

  registerJobHandler('NOTIFICATION_EMAIL', notificationRetryHandler);
  registerJobHandler('NOTIFICATION_SMS', notificationRetryHandler);
  registerJobHandler('NOTIFICATION_WHATSAPP', notificationRetryHandler);
  registerJobHandler('NOTIFICATION_PUSH', notificationRetryHandler);

  registerJobHandler('ADMIN_ALERT', async (payload: any) => {
    await safeTriggerCompanionEvent(
      'dashboard.updated',
      { refresh: true, message: `Retry: New donation ${payload.donationId}`, type: 'DONATION' },
      'admin:dashboard'
    );
  });

  console.log('[DONATION_AGENT] Job handlers registered');
}

// ─── 6. Donation Summary for UI ───────────────────────────────────────────────

export async function getDonationCompletionData(donationId: string) {
  const donation = await prisma.donation.findUnique({
    where: { id: donationId },
    include: {
      receipt: true,
      purposeRelation: { select: { nameEn: true, code: true } },
      branch: { select: { name: true } },
    },
  });

  if (!donation) return null;

  return {
    donationId: donation.id,
    amount: donation.amount,
    currency: donation.currency,
    donorName: donation.donorName || 'Beloved Donor',
    purpose: donation.purposeRelation?.nameEn || donation.purpose,
    branchName: donation.branch?.name || 'General',
    paymentMethod: donation.paymentMethod,
    razorpayPaymentId: donation.razorpayPaymentId,
    status: donation.status,
    createdAt: donation.createdAt,
    receipt: donation.receipt
      ? {
          id: donation.receipt.id,
          receiptNumber: donation.receipt.receiptNumber,
          verificationCode: donation.receipt.verificationCode,
          issuedAt: donation.receipt.createdAt,
        }
      : null,
  };
}
