/**
 * GET /api/dashboard/donations-chart
 * ─────────────────────────────────────────────────────────────────────────────
 * Returns donation data points for chart rendering.
 * Query: 
 *   - period: daily|weekly|monthly|yearly (default: monthly)
 *   - startDate: Date string
 *   - endDate: Date string
 *
 * Returns array of { label, amount, count } data points ready for charting.
 */
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdminOrDev } from '@/lib/authMiddleware';

export const dynamic = 'force-dynamic';

type Period = 'daily' | 'weekly' | 'monthly' | 'yearly';

export async function GET(req: Request) {
  const auth = await requireAdminOrDev(req);
  if (auth instanceof NextResponse) return auth;

  const { searchParams } = new URL(req.url);
  const period = (searchParams.get('period') || 'monthly') as Period;
  const startDateParam = searchParams.get('startDate');
  const endDateParam = searchParams.get('endDate');

  const hasRange = !!(startDateParam && endDateParam);

  try {
    const now = new Date();
    let startDate: Date;
    let endDate: Date = now;
    let points: number;
    let bucketPeriod: Period = period;

    if (hasRange) {
      startDate = new Date(startDateParam!);
      endDate = new Date(new Date(endDateParam!).setHours(23, 59, 59, 999));
      
      const rangeMs = endDate.getTime() - startDate.getTime();
      const rangeDays = Math.ceil(rangeMs / (24 * 60 * 60 * 1000));
      
      if (rangeDays <= 14) {
        bucketPeriod = 'daily';
        points = rangeDays || 1;
      } else if (rangeDays <= 90) {
        bucketPeriod = 'weekly';
        points = Math.ceil(rangeDays / 7);
      } else {
        bucketPeriod = 'monthly';
        points = (endDate.getFullYear() - startDate.getFullYear()) * 12 + (endDate.getMonth() - startDate.getMonth()) + 1;
        if (points < 2) points = 2;
      }
    } else {
      switch (period) {
        case 'daily':
          startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 29);
          points = 30;
          bucketPeriod = 'daily';
          break;
        case 'weekly':
          startDate = new Date(now);
          startDate.setDate(now.getDate() - 83);
          points = 12;
          bucketPeriod = 'weekly';
          break;
        case 'yearly':
          startDate = new Date(now.getFullYear() - 4, 0, 1);
          points = 5;
          bucketPeriod = 'yearly';
          break;
        case 'monthly':
        default:
          startDate = new Date(now.getFullYear(), now.getMonth() - 11, 1);
          points = 12;
          bucketPeriod = 'monthly';
          break;
      }
    }

    const donations = await prisma.donation.findMany({
      where: {
        status: 'COMPLETED',
        createdAt: { gte: startDate, lte: endDate },
      },
      select: { amount: true, createdAt: true },
      orderBy: { createdAt: 'asc' },
    });

    const buckets: Record<string, { amount: number; count: number }> = {};

    // Helper to format date labels consistently
    const formatDateLabel = (d: Date, mode: Period) => {
      if (mode === 'daily') {
        return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
      } else if (mode === 'weekly') {
        const weekNum = Math.ceil(d.getDate() / 7);
        return `W${weekNum} ${d.toLocaleString('en-IN', { month: 'short' })}`;
      } else if (mode === 'yearly') {
        return String(d.getFullYear());
      } else {
        return d.toLocaleString('en-IN', { month: 'short', year: '2-digit' });
      }
    };

    // Pre-fill all buckets in chronological order to ensure 0-values are represented
    for (let i = 0; i < points; i++) {
      let labelDate = new Date(startDate);
      if (bucketPeriod === 'daily') {
        labelDate.setDate(startDate.getDate() + i);
      } else if (bucketPeriod === 'weekly') {
        labelDate.setDate(startDate.getDate() + i * 7);
      } else if (bucketPeriod === 'yearly') {
        labelDate.setFullYear(startDate.getFullYear() + i);
      } else {
        labelDate.setMonth(startDate.getMonth() + i);
      }
      const label = formatDateLabel(labelDate, bucketPeriod);
      buckets[label] = { amount: 0, count: 0 };
    }

    // Fill with real data
    for (const d of donations) {
      const dt = new Date(d.createdAt);
      const label = formatDateLabel(dt, bucketPeriod);

      if (buckets[label]) {
        buckets[label].amount += d.amount;
        buckets[label].count += 1;
      }
    }

    const chartData = Object.entries(buckets).map(([label, v]) => ({
      label,
      amount: Math.round(v.amount * 100) / 100,
      count: v.count,
    }));

    return NextResponse.json({ success: true, period: bucketPeriod, chartData });
  } catch (err: any) {
    console.error('[DASHBOARD/DONATIONS-CHART/GET] Error:', err);
    return NextResponse.json(
      { error: err?.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
