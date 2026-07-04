/**
 * GET /api/dashboard/donations-chart
 * ─────────────────────────────────────────────────────────────────────────────
 * Returns donation data points for chart rendering.
 * Query: ?period=daily|weekly|monthly|yearly  (default: monthly)
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

  try {
    const now = new Date();
    let startDate: Date;
    let points: number;

    switch (period) {
      case 'daily':
        // Last 30 days
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 29);
        points = 30;
        break;
      case 'weekly':
        // Last 12 weeks
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 83);
        points = 12;
        break;
      case 'yearly':
        // Last 5 years
        startDate = new Date(now.getFullYear() - 4, 0, 1);
        points = 5;
        break;
      case 'monthly':
      default:
        // Last 12 months
        startDate = new Date(now.getFullYear(), now.getMonth() - 11, 1);
        points = 12;
        break;
    }

    const donations = await prisma.donation.findMany({
      where: {
        status: 'COMPLETED',
        createdAt: { gte: startDate },
      },
      select: { amount: true, createdAt: true },
      orderBy: { createdAt: 'asc' },
    });

    // Build label -> { amount, count } map
    const buckets: Record<string, { amount: number; count: number }> = {};

    // Pre-fill all labels with 0
    for (let i = 0; i < points; i++) {
      let label: string;
      if (period === 'daily') {
        const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - (points - 1 - i));
        label = d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
      } else if (period === 'weekly') {
        const d = new Date(now);
        d.setDate(now.getDate() - (points - 1 - i) * 7);
        label = `W${Math.ceil(d.getDate() / 7)} ${d.toLocaleString('en-IN', { month: 'short' })}`;
      } else if (period === 'yearly') {
        label = String(now.getFullYear() - (points - 1 - i));
      } else {
        const d = new Date(now.getFullYear(), now.getMonth() - (points - 1 - i), 1);
        label = d.toLocaleString('en-IN', { month: 'short', year: '2-digit' });
      }
      buckets[label] = { amount: 0, count: 0 };
    }

    // Fill with real data
    for (const d of donations) {
      let label: string;
      const dt = new Date(d.createdAt);

      if (period === 'daily') {
        label = dt.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
      } else if (period === 'weekly') {
        const weekOfMonth = Math.ceil(dt.getDate() / 7);
        label = `W${weekOfMonth} ${dt.toLocaleString('en-IN', { month: 'short' })}`;
      } else if (period === 'yearly') {
        label = String(dt.getFullYear());
      } else {
        label = dt.toLocaleString('en-IN', { month: 'short', year: '2-digit' });
      }

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

    return NextResponse.json({ success: true, period, chartData });
  } catch (err: any) {
    console.error('[DASHBOARD/DONATIONS-CHART/GET] Error:', err);
    return NextResponse.json(
      { error: err?.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
