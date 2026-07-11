import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthenticatedUser } from '@/lib/authMiddleware';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    // 1. Authorization: check if the user is an admin or pastor
    const authUser = await getAuthenticatedUser(req);
    const devRole = process.env.NODE_ENV !== 'production'
      ? (process.env.NEXT_PUBLIC_DEV_AUTO_LOGIN?.toLowerCase() ?? '')
      : '';
    const isDevBypass = ['admin', 'super_admin', 'pastor'].includes(devRole);

    if (!isDevBypass) {
      if (!authUser) {
        return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });
      }

      const isAuthorized = ['ADMIN', 'SUPER_ADMIN', 'PASTOR', 'BRANCH_MANAGER'].includes(authUser.role);
      if (!isAuthorized) {
        return NextResponse.json({ error: 'Forbidden: Admin access required.' }, { status: 403 });
      }
    }

    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay())); // Sunday
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfYear = new Date(now.getFullYear(), 0, 1);

    // 2. Fetch Aggregated Totals (Today, Week, Month, Year)
    const [todayAgg, weekAgg, monthAgg, yearAgg] = await Promise.all([
      prisma.donation.aggregate({
        _sum: { amount: true },
        where: { status: 'COMPLETED', createdAt: { gte: startOfToday } },
      }),
      prisma.donation.aggregate({
        _sum: { amount: true },
        where: { status: 'COMPLETED', createdAt: { gte: startOfWeek } },
      }),
      prisma.donation.aggregate({
        _sum: { amount: true },
        where: { status: 'COMPLETED', createdAt: { gte: startOfMonth } },
      }),
      prisma.donation.aggregate({
        _sum: { amount: true },
        where: { status: 'COMPLETED', createdAt: { gte: startOfYear } },
      }),
    ]);

    // 3. Fetch Branch Donations Breakdown
    const branchDonationsRaw = await prisma.donation.groupBy({
      by: ['branchId'],
      _sum: { amount: true },
      where: { status: 'COMPLETED' },
    });

    const branches = await prisma.branch.findMany({
      select: { id: true, name: true },
    });

    const branchBreakdown = branchDonationsRaw.map((b) => {
      const bObj = branches.find((branch) => branch.id === b.branchId);
      return {
        branchName: bObj ? bObj.name : 'General',
        totalAmount: b._sum.amount || 0,
      };
    });

    // 4. Fetch Purpose Donations Breakdown
    const purposeDonationsRaw = await prisma.donation.groupBy({
      by: ['purpose'],
      _sum: { amount: true },
      where: { status: 'COMPLETED' },
    });

    const purposeBreakdown = purposeDonationsRaw.map((p) => ({
      purpose: p.purpose.replace(/_/g, ' '),
      totalAmount: p._sum.amount || 0,
    }));

    // 5. Fetch Recent Donations (last 10)
    const recentDonations = await prisma.donation.findMany({
      take: 10,
      where: { status: 'COMPLETED' },
      orderBy: { createdAt: 'desc' },
      include: {
        branch: { select: { name: true } },
      },
    });

    // 6. Fetch Top Donors
    const topDonorsRaw = await prisma.donation.groupBy({
      by: ['donorEmail', 'donorName'],
      _sum: { amount: true },
      where: { status: 'COMPLETED' },
      orderBy: {
        _sum: { amount: 'desc' },
      },
      take: 5,
    });

    const topDonors = topDonorsRaw.map((d) => ({
      name: d.donorName || 'Anonymous Giver',
      email: d.donorEmail || 'N/A',
      totalContributed: d._sum.amount || 0,
    }));

    return NextResponse.json({
      success: true,
      stats: {
        todayTotal: todayAgg._sum.amount || 0,
        weeklyTotal: weekAgg._sum.amount || 0,
        monthlyTotal: monthAgg._sum.amount || 0,
        yearlyTotal: yearAgg._sum.amount || 0,
      },
      branchBreakdown,
      purposeBreakdown,
      recentDonations,
      topDonors,
    });
  } catch (err: any) {
    console.error('[API/DASHBOARD/DONATIONS] Error:', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
