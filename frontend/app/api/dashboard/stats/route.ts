/**
 * GET /api/dashboard/stats
 * ─────────────────────────────────────────────────────────────────────────────
 * Single aggregation endpoint that returns ALL admin dashboard KPIs in one
 * optimised set of DB queries — avoids 10 separate waterfall fetches.
 *
 * Query parameters:
 *   - startDate: Date string (ISO or YYYY-MM-DD)
 *   - endDate: Date string (ISO or YYYY-MM-DD)
 *
 * Returns:
 *   members  — total, today, thisWeek (this period), lastMonth (prev period), growthPct
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
    const { searchParams } = new URL(req.url);
    const startDateParam = searchParams.get('startDate');
    const endDateParam = searchParams.get('endDate');

    const now = new Date();
    const hasRange = !!(startDateParam && endDateParam);
    
    // Default to last 7 days if no range provided
    const start = hasRange ? new Date(startDateParam) : new Date(now.getFullYear(), now.getMonth(), now.getDate() - 6);
    const end = hasRange ? new Date(new Date(endDateParam).setHours(23, 59, 59, 999)) : now;

    // Previous period for comparison
    const rangeMs = end.getTime() - start.getTime();
    const prevStart = new Date(start.getTime() - rangeMs);
    const prevEnd = new Date(start.getTime() - 1);

    // ── Run all DB queries in parallel ─────────────────────────────────────────
    const [
      totalMembers,
      newMembersThisPeriod,
      newMembersPrevPeriod,
      allDonations,
      prevDonationsAgg,
      allAttendance,
      prevAttendanceAgg,
      eventCounts,
      prayerUnread,
      pendingDonationsCount,
      mediaTotal,
      volunteersTotal,
      ngoVolunteersTotal,
      recentMembers,
      sermonTotal,
    ] = await Promise.all([
      // Members cumulative up to end of period
      prisma.user.count({ where: { createdAt: { lte: end } } }),
      // New members in this period
      prisma.user.count({ where: { createdAt: { gte: start, lte: end } } }),
      // New members in previous period
      prisma.user.count({ where: { createdAt: { gte: prevStart, lte: prevEnd } } }),

      // Completed donations in this period
      prisma.donation.findMany({
        where: { status: 'COMPLETED', createdAt: { gte: start, lte: end } },
        select: { amount: true, purpose: true, paymentMethod: true, createdAt: true },
      }),
      // Completed donations in previous period (for comparison)
      prisma.donation.aggregate({
        where: { status: 'COMPLETED', createdAt: { gte: prevStart, lte: prevEnd } },
        _sum: { amount: true },
      }),

      // Attendance records in this period
      prisma.attendanceRecord.findMany({
        where: { date: { gte: start, lte: end } },
        orderBy: { date: 'desc' },
        select: { serviceType: true, headcount: true, newVisitors: true, date: true },
      }),
      // Attendance in previous period (for comparison)
      prisma.attendanceRecord.aggregate({
        where: { date: { gte: prevStart, lte: prevEnd } },
        _sum: { headcount: true },
      }),

      // Event counts by status (overall)
      prisma.event.groupBy({
        by: ['status'],
        _count: { _all: true },
      }),

      // Prayer requests unread (PENDING) (overall)
      prisma.prayerRequest.count({ where: { status: 'PENDING' } }),

      // Pending donations count (overall)
      prisma.donation.count({ where: { status: 'PENDING' } }),

      // Media uploads (overall)
      prisma.gallery.count(),

      // Church volunteers (overall)
      prisma.volunteer.count(),

      // NGO volunteers (overall)
      prisma.ngoVolunteer.count(),

      // Recent 10 members created in this period (or overall if period has few)
      prisma.user.findMany({
        where: hasRange ? { createdAt: { gte: start, lte: end } } : undefined,
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

      // Sermon total (overall)
      prisma.sermon.count(),
    ]);

    // If custom range yielded fewer than 5 members, fill with overall recent members
    let displayRecentMembers = recentMembers;
    if (hasRange && recentMembers.length < 5) {
      displayRecentMembers = await prisma.user.findMany({
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
      });
    }

    // ── Member growth % ────────────────────────────────────────────────────────
    const memberGrowthPct =
      newMembersPrevPeriod > 0
        ? Math.round(((newMembersThisPeriod - newMembersPrevPeriod) / newMembersPrevPeriod) * 100)
        : newMembersThisPeriod > 0
        ? 100
        : 0;

    // ── Donation aggregations ──────────────────────────────────────────────────
    const totalDonationAmount = allDonations.reduce((s, d) => s + d.amount, 0);
    const avgDonation = allDonations.length > 0 ? totalDonationAmount / allDonations.length : 0;
    const prevDonationAmount = prevDonationsAgg._sum.amount ?? 0;

    const donationGrowthPct =
      prevDonationAmount > 0
        ? Math.round(((totalDonationAmount - prevDonationAmount) / prevDonationAmount) * 100)
        : totalDonationAmount > 0
        ? 100
        : 0;

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

    // If no attendance records in this period, fetch the single latest overall record for latestHeadcount
    let latestHeadcount = allAttendance[0]?.headcount ?? 0;
    if (allAttendance.length === 0) {
      const lastOverallRecord = await prisma.attendanceRecord.findFirst({
        orderBy: { date: 'desc' },
        select: { headcount: true },
      });
      latestHeadcount = lastOverallRecord?.headcount ?? 0;
    }

    const prevAttendanceAmount = prevAttendanceAgg._sum.headcount ?? 0;
    const attendanceGrowthPct =
      prevAttendanceAmount > 0
        ? Math.round(((totalHeadcount - prevAttendanceAmount) / prevAttendanceAmount) * 100)
        : totalHeadcount > 0
        ? 100
        : 0;

    // Group by service type
    const byServiceType: Record<string, number> = {};
    for (const r of allAttendance) {
      const key = r.serviceType || 'Other';
      byServiceType[key] = (byServiceType[key] ?? 0) + r.headcount;
    }

    // ── Event counts by status ──────────────────────────────────────────────────
    const eventStatusMap: Record<string, number> = {
      DRAFT: 0,
      PUBLISHED: 0,
      CANCELLED: 0,
      COMPLETED: 0,
    };
    for (const g of eventCounts) {
      eventStatusMap[g.status] = g._count._all;
    }

    // Upcoming events: date >= start of range
    const upcomingCount = await prisma.event.count({
      where: { status: 'PUBLISHED', date: { gte: start } },
    });
    const pastCount = await prisma.event.count({
      where: { status: 'PUBLISHED', date: { lt: start } },
    });

    return NextResponse.json({
      success: true,
      stats: {
        members: {
          total: totalMembers,
          today: newMembersThisPeriod, // Map new members count to "today/thisWeek" properties
          thisWeek: newMembersThisPeriod,
          thisMonth: newMembersThisPeriod,
          lastMonth: newMembersPrevPeriod,
          growthPct: memberGrowthPct,
        },
        donations: {
          total: totalDonationAmount,
          today: totalDonationAmount,
          thisWeek: totalDonationAmount,
          thisMonth: totalDonationAmount,
          thisYear: totalDonationAmount,
          count: allDonations.length,
          avg: avgDonation,
          byCategory,
          byMethod,
          growthPct: donationGrowthPct, // Return computed growth rate
        },
        attendance: {
          total: totalHeadcount,
          totalNewVisitors,
          avgPerRecord,
          recordCount: allAttendance.length,
          latestHeadcount,
          byServiceType,
          growthPct: attendanceGrowthPct, // Return computed growth rate
        },
        events: {
          total: eventStatusMap.DRAFT + eventStatusMap.PUBLISHED + eventStatusMap.COMPLETED + eventStatusMap.CANCELLED,
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
        recentMembers: displayRecentMembers,
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
