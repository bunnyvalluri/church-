/**
 * lib/donationAnalytics.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Analytics event tracker and aggregation for the KCM Donation Agent.
 *
 * Tracks:
 *  • Conversion funnel (step-by-step drop-off)
 *  • Payment success/failure rates per cause/branch/method
 *  • Average donation per campaign/cause
 *  • Notification delivery rates per channel
 *  • Repeat donor detection
 *  • Session abandonment points
 */

import { prisma } from '@/lib/prisma';
import { logAgentEvent } from '@/lib/donationRetryQueue';

// ─── Funnel Event Types ───────────────────────────────────────────────────────

export type FunnelEvent =
  | 'PAGE_VIEWED'
  | 'AMOUNT_STEP_VIEWED'
  | 'AMOUNT_PRESET_CLICKED'
  | 'AMOUNT_CUSTOM_ENTERED'
  | 'AMOUNT_CONFIRMED'
  | 'DONOR_STEP_VIEWED'
  | 'DONOR_FORM_STARTED'
  | 'DONOR_FORM_COMPLETED'
  | 'ORDER_CREATION_STARTED'
  | 'ORDER_CREATED'
  | 'ORDER_CREATION_FAILED'
  | 'QR_DISPLAYED'
  | 'QR_SCAN_ATTEMPTED'
  | 'PAYMENT_INITIATED'
  | 'PAYMENT_VERIFIED'
  | 'PAYMENT_FAILED'
  | 'PAYMENT_EXPIRED'
  | 'RECEIPT_GENERATED'
  | 'RECEIPT_DOWNLOADED'
  | 'RECEIPT_SHARED'
  | 'NOTIFICATION_SENT'
  | 'SESSION_ABANDONED'
  | 'SESSION_COMPLETED';

// ─── Track Event ──────────────────────────────────────────────────────────────

export async function trackDonationEvent(
  event: FunnelEvent,
  context: {
    sessionId?: string;
    donationId?: string;
    memberId?: string;
    amount?: number;
    purposeCode?: string;
    branchId?: string;
    channel?: string;
    error?: string;
    metadata?: Record<string, unknown>;
    ip?: string;
    userAgent?: string;
  }
): Promise<void> {
  await logAgentEvent(context.donationId, context.sessionId, event, {
    memberId: context.memberId,
    amount: context.amount,
    purposeCode: context.purposeCode,
    branchId: context.branchId,
    channel: context.channel,
    error: context.error,
    ...context.metadata,
  });
}

// ─── Conversion Funnel Report ─────────────────────────────────────────────────

export interface FunnelStep {
  event: string;
  count: number;
  conversionRate: number; // % of PAGE_VIEWED that reached this step
}

export async function getConversionFunnel(
  days = 30
): Promise<FunnelStep[]> {
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  const FUNNEL_STEPS: FunnelEvent[] = [
    'PAGE_VIEWED',
    'AMOUNT_CONFIRMED',
    'DONOR_FORM_COMPLETED',
    'ORDER_CREATED',
    'QR_DISPLAYED',
    'PAYMENT_VERIFIED',
    'RECEIPT_GENERATED',
    'SESSION_COMPLETED',
  ];

  const counts = await Promise.all(
    FUNNEL_STEPS.map((evt) =>
      prisma.donationAgentEvent.count({
        where: { event: evt, createdAt: { gte: since } },
      })
    )
  );

  const topCount = counts[0] || 1;

  return FUNNEL_STEPS.map((evt, i) => ({
    event: evt,
    count: counts[i],
    conversionRate: Math.round((counts[i] / topCount) * 100),
  }));
}

// ─── Payment Success Rate ─────────────────────────────────────────────────────

export async function getPaymentSuccessRate(days = 30): Promise<{
  total: number;
  successful: number;
  failed: number;
  expired: number;
  rate: number;
}> {
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  const [total, successful, failed, expired] = await Promise.all([
    prisma.donationSession.count({ where: { createdAt: { gte: since } } }),
    prisma.donationSession.count({ where: { status: 'COMPLETED', createdAt: { gte: since } } }),
    prisma.donationSession.count({ where: { status: 'FAILED', createdAt: { gte: since } } }),
    prisma.donationSession.count({ where: { status: 'EXPIRED', createdAt: { gte: since } } }),
  ]);

  return {
    total,
    successful,
    failed,
    expired,
    rate: total > 0 ? Math.round((successful / total) * 100) : 0,
  };
}

// ─── Donations by Cause ───────────────────────────────────────────────────────

export async function getDonationsByCause(
  days = 30
): Promise<Array<{ purposeCode: string; purposeName: string; count: number; totalAmount: number }>> {
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  const results = await prisma.donation.groupBy({
    by: ['purpose'],
    where: { status: 'COMPLETED', createdAt: { gte: since } },
    _count: { id: true },
    _sum: { amount: true },
    orderBy: { _sum: { amount: 'desc' } },
  });

  return results.map((r) => ({
    purposeCode: r.purpose,
    purposeName: r.purpose.replace(/_/g, ' '),
    count: r._count.id,
    totalAmount: r._sum.amount || 0,
  }));
}

// ─── Donations by Branch ──────────────────────────────────────────────────────

export async function getDonationsByBranch(
  days = 30
): Promise<Array<{ branchId: string; branchName: string; count: number; totalAmount: number }>> {
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  const results = await prisma.donation.findMany({
    where: { status: 'COMPLETED', createdAt: { gte: since }, branchId: { not: null } },
    include: { branch: { select: { id: true, name: true } } },
  });

  const byBranch = new Map<string, { name: string; count: number; total: number }>();

  for (const d of results) {
    const key = d.branchId || 'unknown';
    const existing = byBranch.get(key) || { name: d.branch?.name || 'Unknown', count: 0, total: 0 };
    existing.count++;
    existing.total += d.amount;
    byBranch.set(key, existing);
  }

  return Array.from(byBranch.entries())
    .map(([branchId, v]) => ({ branchId, branchName: v.name, count: v.count, totalAmount: v.total }))
    .sort((a, b) => b.totalAmount - a.totalAmount);
}

// ─── Average Donation ─────────────────────────────────────────────────────────

export async function getAverageDonation(days = 30): Promise<number> {
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  const result = await prisma.donation.aggregate({
    where: { status: 'COMPLETED', createdAt: { gte: since } },
    _avg: { amount: true },
  });
  return Math.round(result._avg.amount || 0);
}

// ─── Repeat Donor Detection ───────────────────────────────────────────────────

export async function getRepeatDonors(days = 90): Promise<{
  total: number;
  repeat: number;
  repeatRate: number;
}> {
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  const donors = await prisma.donation.groupBy({
    by: ['userId'],
    where: {
      status: 'COMPLETED',
      createdAt: { gte: since },
      userId: { not: null },
    },
    _count: { id: true },
  });

  const total = donors.length;
  const repeat = donors.filter((d) => d._count.id > 1).length;

  return {
    total,
    repeat,
    repeatRate: total > 0 ? Math.round((repeat / total) * 100) : 0,
  };
}

// ─── Notification Delivery Rate ───────────────────────────────────────────────

export async function getNotificationDeliveryRate(
  days = 30
): Promise<Record<string, { sent: number; failed: number; rate: number }>> {
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  const logs = await prisma.notificationLog.findMany({
    where: { sentAt: { gte: since } },
    select: { channel: true, status: true },
  });

  const channels: Record<string, { sent: number; failed: number }> = {};

  for (const log of logs) {
    const ch = log.channel || 'UNKNOWN';
    if (!channels[ch]) channels[ch] = { sent: 0, failed: 0 };
    if (log.status === 'SENT' || log.status === 'DELIVERED') channels[ch].sent++;
    else if (log.status === 'FAILED') channels[ch].failed++;
  }

  return Object.fromEntries(
    Object.entries(channels).map(([ch, v]) => {
      const total = v.sent + v.failed;
      return [ch, { ...v, rate: total > 0 ? Math.round((v.sent / total) * 100) : 0 }];
    })
  );
}

// ─── Recent Donations Feed ────────────────────────────────────────────────────

export async function getRecentDonations(limit = 20): Promise<
  Array<{
    id: string;
    donorName: string;
    amount: number;
    purpose: string;
    status: string;
    createdAt: Date;
  }>
> {
  const donations = await prisma.donation.findMany({
    where: { status: 'COMPLETED' },
    orderBy: { createdAt: 'desc' },
    take: limit,
    select: {
      id: true,
      donorName: true,
      amount: true,
      purpose: true,
      status: true,
      createdAt: true,
    },
  });

  return donations.map((d) => ({
    ...d,
    donorName: d.donorName || 'Anonymous Giver',
  }));
}

// ─── Summary Dashboard Stats ──────────────────────────────────────────────────

export async function getDashboardSummary(): Promise<{
  totalDonations: number;
  totalAmount: number;
  todayAmount: number;
  monthAmount: number;
  pendingCount: number;
  avgDonation: number;
}> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);

  const [totalResult, todayResult, monthResult, pendingCount, avgResult] = await Promise.all([
    prisma.donation.aggregate({
      where: { status: 'COMPLETED' },
      _count: { id: true },
      _sum: { amount: true },
    }),
    prisma.donation.aggregate({
      where: { status: 'COMPLETED', createdAt: { gte: today } },
      _sum: { amount: true },
    }),
    prisma.donation.aggregate({
      where: { status: 'COMPLETED', createdAt: { gte: monthStart } },
      _sum: { amount: true },
    }),
    prisma.donationSession.count({ where: { status: 'PROCESSING' } }),
    prisma.donation.aggregate({
      where: { status: 'COMPLETED' },
      _avg: { amount: true },
    }),
  ]);

  return {
    totalDonations: totalResult._count.id,
    totalAmount: totalResult._sum.amount || 0,
    todayAmount: todayResult._sum.amount || 0,
    monthAmount: monthResult._sum.amount || 0,
    pendingCount,
    avgDonation: Math.round(avgResult._avg.amount || 0),
  };
}
