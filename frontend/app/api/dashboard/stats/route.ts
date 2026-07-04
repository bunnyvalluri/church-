/**
 * GET /api/dashboard/stats
 * ─────────────────────────────────────────────────────────────────────────────
 * Single aggregation endpoint that returns ALL admin dashboard KPIs in one
 * optimised set of DB queries — avoids 10 separate waterfall fetches.
 *
 * Returns:
 *   members  — total, today, thisWeek, thisMonth, lastMonth, growthPct
 *   donations — total, today, thisWeek, thisMonth, thisYear, avg, byCategory, byMethod
 *   attendance — total, byServiceType, avgPerRecord, latestHeadcount
 *   events    — total, upcoming, ongoing, completed, cancelled, draft
 *   sidebar   — prayerRequestsUnread, donationsPending, eventsUpcoming, mediaTotal, volunteersTotal
 *   recentMembers — last 10 members (id, name, email, phone, role, image, createdAt)
 */
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdminOrDev } from '@/lib/authMiddleware';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const auth = await requireAdminOrDev(req);
  if (auth instanceof NextResponse) return auth;

  try {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfThisWeek = new Date(startOfToday);
    startOfThisWeek.setDate(startOfToday.getDate() - startOfToday.getDay());
    const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
    const startOfThisYear = new Date(now.getFullYear(), 0, 1);

    // ── Run all DB queries in parallel ─────────────────────────────────────────
    const [
      totalMembers,
      todayMembers,
      thisWeekMembers,
      thisMonthMembers,
      lastMonthMembers,
      allDonations,
      todayDonations,
      thisWeekDonations,
      thisMonthDonations,
      thisYearDonations,
      allAttendance,
      eventCounts,
      prayerUnread,
      pendingDonationsCount,
      mediaTotal,
      volunteersTotal,
      ngoVolunteersTotal,
      recentMembers,
      sermonTotal,
    ] = await Promise.all([
      // Members
      prisma.user.count(),
      prisma.user.count({ where: { createdAt: { gte: startOfToday } } }),
      prisma.user.count({ where: { createdAt: { gte: startOfThisWeek } } }),
      prisma.user.count({ where: { createdAt: { gte: startOfThisMonth } } }),
      prisma.user.count({ where: { createdAt: { gte: startOfLastMonth, lte: endOfLastMonth } } }),

      // All completed donations (for aggregations)
      prisma.donation.findMany({
        where: { status: 'COMPLETED' },
        select: { amount: true, purpose: true, paymentMethod: true, createdAt: true },
      }),
      // Today's completed donations
      prisma.donation.aggregate({
        where: { status: 'COMPLETED', createdAt: { gte: startOfToday } },
        _sum: { amount: true },
      }),
      // This week
      prisma.donation.aggregate({
        where: { status: 'COMPLETED', createdAt: { gte: startOfThisWeek } },
        _sum: { amount: true },
      }),
      // This month
      prisma.donation.aggregate({
        where: { status: 'COMPLETED', createdAt: { gte: startOfThisMonth } },
        _sum: { amount: true },
      }),
      // This year
      prisma.donation.aggregate({
        where: { status: 'COMPLETED', createdAt: { gte: startOfThisYear } },
        _sum: { amount: true },
      }),

      // All attendance records
      prisma.attendanceRecord.findMany({
        orderBy: { date: 'desc' },
        select: { serviceType: true, headcount: true, newVisitors: true, date: true },
      }),

      // Event counts by status
      prisma.event.groupBy({
        by: ['status'],
        _count: { _all: true },
      }),

      // Prayer requests unread (PENDING)
      prisma.prayerRequest.count({ where: { status: 'PENDING' } }),

      // Pending donations count
      prisma.donation.count({ where: { status: 'PENDING' } }),

      // Media uploads (Gallery + NgoMedia combined)
      prisma.gallery.count(),

      // Church volunteers
      prisma.volunteer.count(),

      // NGO volunteers
      prisma.ngoVolunteer.count(),

      // Recent 10 members
      prisma.user.findMany({
        orderBy: { createdAt: 'desc' },
        take: 10,
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          role: true,
          image: true,
          createdAt: true,
          emailVerified: true,
        },
      }),

      // Sermon total
      prisma.sermon.count(),
    ]);

    // ── Member growth % ────────────────────────────────────────────────────────
    const memberGrowthPct =
      lastMonthMembers > 0
        ? Math.round(((thisMonthMembers - lastMonthMembers) / lastMonthMembers) * 100)
        : thisMonthMembers > 0
        ? 100
        : 0;

    // ── Donation aggregations ──────────────────────────────────────────────────
    const totalDonationAmount = allDonations.reduce((s, d) => s + d.amount, 0);
    const avgDonation = allDonations.length > 0 ? totalDonationAmount / allDonations.length : 0;

    // Group by purpose/category
    const byCategory: Record<string, number> = {};
    const byMethod: Record<string, number> = {};
    for (const d of allDonations) {
      byCategory[d.purpose] = (byCategory[d.purpose] ?? 0) + d.amount;
      byMethod[d.paymentMethod] = (byMethod[d.paymentMethod] ?? 0) + d.amount;
    }

    // ── Attendance aggregations ─────────────────────────────────────────────────
    const totalHeadcount = allAttendance.reduce((s, r) => s + r.headcount, 0);
    const totalNewVisitors = allAttendance.reduce((s, r) => s + r.newVisitors, 0);
    const avgPerRecord =
      allAttendance.length > 0 ? Math.round(totalHeadcount / allAttendance.length) : 0;

    // Group by service type
    const byServiceType: Record<string, number> = {};
    for (const r of allAttendance) {
      const key = r.serviceType || 'Other';
      byServiceType[key] = (byServiceType[key] ?? 0) + r.headcount;
    }

    // ── Event counts by status ──────────────────────────────────────────────────
    const now2 = new Date();
    const eventStatusMap: Record<string, number> = {
      DRAFT: 0,
      PUBLISHED: 0,
      CANCELLED: 0,
      COMPLETED: 0,
    };
    for (const g of eventCounts) {
      eventStatusMap[g.status] = g._count._all;
    }

    // Upcoming = PUBLISHED events with date >= now
    const upcomingCount = await prisma.event.count({
      where: { status: 'PUBLISHED', date: { gte: now2 } },
    });
    const pastCount = await prisma.event.count({
      where: { status: 'PUBLISHED', date: { lt: now2 } },
    });

    // ── Build response ──────────────────────────────────────────────────────────
    return NextResponse.json({
      success: true,
      stats: {
        members: {
          total: totalMembers,
          today: todayMembers,
          thisWeek: thisWeekMembers,
          thisMonth: thisMonthMembers,
          lastMonth: lastMonthMembers,
          growthPct: memberGrowthPct,
        },
        donations: {
          total: totalDonationAmount,
          today: todayDonations._sum.amount ?? 0,
          thisWeek: thisWeekDonations._sum.amount ?? 0,
          thisMonth: thisMonthDonations._sum.amount ?? 0,
          thisYear: thisYearDonations._sum.amount ?? 0,
          count: allDonations.length,
          avg: avgDonation,
          byCategory,
          byMethod,
        },
        attendance: {
          total: totalHeadcount,
          totalNewVisitors,
          avgPerRecord,
          recordCount: allAttendance.length,
          latestHeadcount: allAttendance[0]?.headcount ?? 0,
          byServiceType,
        },
        events: {
          total: totalMembers > 0 ? eventStatusMap.DRAFT + eventStatusMap.PUBLISHED + eventStatusMap.COMPLETED + eventStatusMap.CANCELLED : 0,
          draft: eventStatusMap.DRAFT,
          published: eventStatusMap.PUBLISHED,
          completed: eventStatusMap.COMPLETED,
          cancelled: eventStatusMap.CANCELLED,
          upcoming: upcomingCount,
          past: pastCount,
        },
        content: {
          sermons: sermonTotal,
        },
        sidebar: {
          members: totalMembers,
          prayerRequestsUnread: prayerUnread,
          donationsPending: pendingDonationsCount,
          eventsUpcoming: upcomingCount,
          mediaTotal,
          volunteers: volunteersTotal + ngoVolunteersTotal,
        },
        recentMembers,
      },
    });
  } catch (err: any) {
    console.error('[DASHBOARD/STATS/GET] Error:', err);
    return NextResponse.json(
      { error: err?.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
