import { NextResponse } from 'next/server';
import {
  getDashboardSummary,
  getDonationsByCause,
  getConversionFunnel,
  getPaymentSuccessRate,
  getRecentDonations,
} from '@/lib/donationAnalytics';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const type = searchParams.get('type') || 'summary';

  try {
    if (type === 'summary') {
      const data = await getDashboardSummary();
      return NextResponse.json({ success: true, data });
    }

    if (type === 'causes') {
      const data = await getDonationsByCause(30);
      return NextResponse.json({ success: true, data });
    }

    if (type === 'funnel') {
      const data = await getConversionFunnel(30);
      return NextResponse.json({ success: true, data });
    }

    if (type === 'success_rate') {
      const data = await getPaymentSuccessRate(30);
      return NextResponse.json({ success: true, data });
    }

    if (type === 'recent') {
      const data = await getRecentDonations(20);
      return NextResponse.json({ success: true, data });
    }

    return NextResponse.json({ error: 'Invalid stats type requested' }, { status: 400 });
  } catch (err: any) {
    console.error('[ADMIN_STATS_API] Error:', err?.message || err);
    return NextResponse.json({ error: 'Failed to fetch admin stats' }, { status: 500 });
  }
}
