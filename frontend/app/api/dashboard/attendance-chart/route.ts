/**
 * GET /api/dashboard/attendance-chart
 * ─────────────────────────────────────────────────────────────────────────────
 * Returns attendance data by service type and date for chart rendering.
 * Query: ?period=weekly|monthly|yearly  (default: weekly)
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

  try {
    const now = new Date();
    let startDate: Date;

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

    const records = await prisma.attendanceRecord.findMany({
      where: { date: { gte: startDate } },
      orderBy: { date: 'asc' },
      select: { date: true, serviceType: true, headcount: true, newVisitors: true },
    });

    // Get all unique service types
    const serviceTypes = [...new Set(records.map((r) => r.serviceType))];

    // Build time-bucketed data for the primary bar chart (latest 7 records)
    const last7 = await prisma.attendanceRecord.findMany({
      orderBy: { date: 'desc' },
      take: 7,
      select: { date: true, serviceType: true, headcount: true, newVisitors: true },
    });

    // Aggregate by service type (total headcount per service type)
    const byServiceType: Record<string, number> = {};
    const byServiceTypeNewVisitors: Record<string, number> = {};
    for (const r of records) {
      const key = r.serviceType || 'Other';
      byServiceType[key] = (byServiceType[key] ?? 0) + r.headcount;
      byServiceTypeNewVisitors[key] = (byServiceTypeNewVisitors[key] ?? 0) + r.newVisitors;
    }

    // Comparison: this month vs last month
    const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);

    const thisMonthAtt = records.filter((r) => new Date(r.date) >= startOfThisMonth);
    const lastMonthAtt = records.filter(
      (r) => new Date(r.date) >= startOfLastMonth && new Date(r.date) <= endOfLastMonth
    );

    const thisMonthTotal = thisMonthAtt.reduce((s, r) => s + r.headcount, 0);
    const lastMonthTotal = lastMonthAtt.reduce((s, r) => s + r.headcount, 0);

    return NextResponse.json({
      success: true,
      period,
      serviceTypes,
      byServiceType,
      byServiceTypeNewVisitors,
      recent: last7.reverse(),
      comparison: {
        thisMonth: thisMonthTotal,
        lastMonth: lastMonthTotal,
        changePct:
          lastMonthTotal > 0
            ? Math.round(((thisMonthTotal - lastMonthTotal) / lastMonthTotal) * 100)
            : thisMonthTotal > 0
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
