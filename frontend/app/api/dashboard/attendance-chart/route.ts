/**
 * GET /api/dashboard/attendance-chart
 * ─────────────────────────────────────────────────────────────────────────────
 * Returns attendance data by service type and date for chart rendering.
 * Query:
 *   - period: weekly|monthly|yearly (default: weekly)
 *   - startDate: Date string
 *   - endDate: Date string
 */
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdminOrDev } from '@/lib/authMiddleware';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const auth = await requireAdminOrDev(req);
  if (auth instanceof NextResponse) return auth;

  const { searchParams } = new URL(req.url);
  const period = searchParams.get('period') || 'weekly';
  const startDateParam = searchParams.get('startDate');
  const endDateParam = searchParams.get('endDate');

  const hasRange = !!(startDateParam && endDateParam);

  try {
    const now = new Date();
    let startDate: Date;
    let endDate: Date = now;

    if (hasRange) {
      startDate = new Date(startDateParam!);
      endDate = new Date(new Date(endDateParam!).setHours(23, 59, 59, 999));
    } else {
      switch (period) {
        case 'monthly':
          startDate = new Date(now.getFullYear(), now.getMonth() - 11, 1);
          break;
        case 'yearly':
          startDate = new Date(now.getFullYear() - 4, 0, 1);
          break;
        case 'weekly':
        default:
          startDate = new Date(now);
          startDate.setDate(now.getDate() - 83); // ~12 weeks
          break;
      }
    }

    const records = await prisma.attendanceRecord.findMany({
      where: { date: { gte: startDate, lte: endDate } },
      orderBy: { date: 'asc' },
      select: { date: true, serviceType: true, headcount: true, newVisitors: true },
    });

    // Get all unique service types
    const serviceTypes = [...new Set(records.map((r) => r.serviceType))];

    // Build time-bucketed data for the primary bar chart (latest 7 records within range)
    const last7 = await prisma.attendanceRecord.findMany({
      where: { date: { gte: startDate, lte: endDate } },
      orderBy: { date: 'desc' },
      take: 7,
      select: { date: true, serviceType: true, headcount: true, newVisitors: true },
    });

    // If there are no records in range, fallback to overall latest 7 records (so the chart isn't blank)
    let displayRecent = last7;
    if (last7.length === 0) {
      displayRecent = await prisma.attendanceRecord.findMany({
        orderBy: { date: 'desc' },
        take: 7,
        select: { date: true, serviceType: true, headcount: true, newVisitors: true },
      });
    }

    // Aggregate by service type (total headcount per service type)
    const byServiceType: Record<string, number> = {};
    const byServiceTypeNewVisitors: Record<string, number> = {};
    for (const r of records) {
      const key = r.serviceType || 'Other';
      byServiceType[key] = (byServiceType[key] ?? 0) + r.headcount;
      byServiceTypeNewVisitors[key] = (byServiceTypeNewVisitors[key] ?? 0) + r.newVisitors;
    }

    // Comparison: this period vs previous period of same length
    const rangeMs = endDate.getTime() - startDate.getTime();
    const prevStart = new Date(startDate.getTime() - rangeMs);
    const prevEnd = new Date(startDate.getTime() - 1);

    const thisPeriodAtt = records; // Since they are filtered to range [startDate, endDate]
    const prevPeriodAtt = await prisma.attendanceRecord.findMany({
      where: { date: { gte: prevStart, lte: prevEnd } },
      select: { headcount: true },
    });

    const thisPeriodTotal = thisPeriodAtt.reduce((s, r) => s + r.headcount, 0);
    const prevPeriodTotal = prevPeriodAtt.reduce((s, r) => s + r.headcount, 0);

    return NextResponse.json({
      success: true,
      period,
      serviceTypes,
      byServiceType,
      byServiceTypeNewVisitors,
      recent: displayRecent.reverse(),
      comparison: {
        thisMonth: thisPeriodTotal,
        lastMonth: prevPeriodTotal,
        changePct:
          prevPeriodTotal > 0
            ? Math.round(((thisPeriodTotal - prevPeriodTotal) / prevPeriodTotal) * 100)
            : thisPeriodTotal > 0
            ? 100
            : 0,
      },
    });
  } catch (err: any) {
    console.error('[DASHBOARD/ATTENDANCE-CHART/GET] Error:', err);
    return NextResponse.json(
      { error: err?.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
