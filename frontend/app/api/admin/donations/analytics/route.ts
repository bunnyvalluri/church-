/**
 * GET /api/admin/donations/analytics
 * ─────────────────────────────────────────────────────────────────────────────
 * Donation analytics endpoint for Admin Dashboard.
 * Returns: Today's giving, monthly totals, top donors, campaign progress,
 * branch performance, average gift, failed payments, repeat donors.
 */

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/authMiddleware';

export const dynamic = 'force-dynamic';

const ALLOWED_ROLES = ['ADMIN', 'SUPER_ADMIN', 'PASTOR', 'NGO_ADMIN'];

export async function GET(req: Request) {
  try {
    const authResult = await requireAdmin(req);
    if (authResult instanceof NextResponse) return authResult;

    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const yearStart = new Date(now.getFullYear(), 0, 1);
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

    // ── Run all queries in parallel ──────────────────────────────────────────
    const [
      todayStats,
      monthStats,
      lastMonthStats,
      yearStats,
      byPurpose,
      byBranch,
      recentDonations,
      failedCount,
      webhookStats,
    ] = await Promise.all([
      // Today's stats
      prisma.donation.aggregate({
        where: { status: 'COMPLETED', createdAt: { gte: todayStart } },
        _sum: { amount: true },
        _count: { id: true },
        _avg: { amount: true },
      }),

      // This month's stats
      prisma.donation.aggregate({
        where: { status: 'COMPLETED', createdAt: { gte: monthStart } },
        _sum: { amount: true },
        _count: { id: true },
        _avg: { amount: true },
      }),

      // Last month's stats
      prisma.donation.aggregate({
        where: { status: 'COMPLETED', createdAt: { gte: lastMonthStart, lte: lastMonthEnd } },
        _sum: { amount: true },
        _count: { id: true },
      }),

      // Year-to-date stats
      prisma.donation.aggregate({
        where: { status: 'COMPLETED', createdAt: { gte: yearStart } },
        _sum: { amount: true },
        _count: { id: true },
      }),

      // By giving purpose
      prisma.donation.groupBy({
        by: ['purpose'],
        where: { status: 'COMPLETED', createdAt: { gte: monthStart } },
        _sum: { amount: true },
        _count: { id: true },
        orderBy: { _sum: { amount: 'desc' } },
        take: 10,
      }),

      // By branch
      prisma.donation.groupBy({
        by: ['branchId'],
        where: { status: 'COMPLETED', createdAt: { gte: monthStart } },
        _sum: { amount: true },
        _count: { id: true },
        orderBy: { _sum: { amount: 'desc' } },
        take: 10,
      }),

      // Recent donations (last 10)
      prisma.donation.findMany({
        where: { status: 'COMPLETED' },
        select: {
          id: true,
          donorName: true,
          amount: true,
          currency: true,
          purpose: true,
          paymentMethod: true,
          upiApp: true,
          campaignName: true,
          createdAt: true,
          branch: { select: { name: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: 10,
      }),

      // Failed payments count (last 30 days)
      prisma.donation.count({
        where: {
          status: 'FAILED',
          createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
        },
      }),

      // Webhook stats
      prisma.paymentWebhook.groupBy({
        by: ['status'],
        _count: { id: true },
        orderBy: { _count: { id: 'desc' } },
      }),
    ]);

    // ── Resolve branch names ─────────────────────────────────────────────────
    const branchIds = byBranch.map(b => b.branchId).filter(Boolean) as string[];
    const branches = branchIds.length > 0
      ? await prisma.branch.findMany({ where: { id: { in: branchIds } }, select: { id: true, name: true } })
      : [];
    const branchMap = new Map(branches.map(b => [b.id, b.name]));

    // ── Month-over-month growth ──────────────────────────────────────────────
    const thisMonthTotal = monthStats._sum.amount || 0;
    const lastMonthTotal = lastMonthStats._sum.amount || 0;
    const growth = lastMonthTotal > 0
      ? Math.round(((thisMonthTotal - lastMonthTotal) / lastMonthTotal) * 100)
      : null;

    // ── Top donors this month ────────────────────────────────────────────────
    const topDonors = await prisma.donation.groupBy({
      by: ['donorName', 'donorEmail'],
      where: { status: 'COMPLETED', createdAt: { gte: monthStart } },
      _sum: { amount: true },
      _count: { id: true },
      orderBy: { _sum: { amount: 'desc' } },
      take: 5,
    });

    // ── UPI app distribution ──────────────────────────────────────────────────
    const byUpiApp = await prisma.donation.groupBy({
      by: ['upiApp'],
      where: { status: 'COMPLETED', createdAt: { gte: monthStart } },
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
    });

    return NextResponse.json({
      success: true,
      generatedAt: new Date().toISOString(),
      summary: {
        today: {
          total: todayStats._sum.amount || 0,
          count: todayStats._count.id,
          average: Math.round((todayStats._avg.amount || 0) * 100) / 100,
        },
        thisMonth: {
          total: monthStats._sum.amount || 0,
          count: monthStats._count.id,
          average: Math.round((monthStats._avg.amount || 0) * 100) / 100,
          growthPct: growth,
        },
        lastMonth: {
          total: lastMonthStats._sum.amount || 0,
          count: lastMonthStats._count.id,
        },
        yearToDate: {
          total: yearStats._sum.amount || 0,
          count: yearStats._count.id,
        },
        failedPayments30d: failedCount,
      },
      byPurpose: byPurpose.map(p => ({
        purpose: p.purpose,
        total: p._sum.amount || 0,
        count: p._count.id,
      })),
      byBranch: byBranch.map(b => ({
        branchId: b.branchId,
        branchName: b.branchId ? branchMap.get(b.branchId) || 'Unknown' : 'Head Office',
        total: b._sum.amount || 0,
        count: b._count.id,
      })),
      byUpiApp: byUpiApp.map(a => ({
        app: a.upiApp || 'UNKNOWN',
        count: a._count.id,
      })),
      topDonors: topDonors.map(d => ({
        name: d.donorName || 'Anonymous',
        email: d.donorEmail?.replace(/(.{3}).*(@.*)/, '$1***$2') || '',
        total: d._sum.amount || 0,
        donations: d._count.id,
      })),
      recentDonations: recentDonations.map(d => ({
        id: d.id,
        donorName: d.donorName || 'Anonymous',
        amount: d.amount,
        currency: d.currency,
        purpose: d.purpose,
        branchName: d.branch?.name || 'General',
        upiApp: d.upiApp || 'UPI',
        campaignName: d.campaignName,
        createdAt: d.createdAt,
      })),
      webhooks: {
        byStatus: webhookStats.map(w => ({ status: w.status, count: w._count.id })),
      },
    });

  } catch (err: any) {
    console.error('[ADMIN/ANALYTICS]', err?.message);
    return NextResponse.json({ error: 'Failed to load analytics' }, { status: 500 });
  }
}
