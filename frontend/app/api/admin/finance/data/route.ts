import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdminOrDev } from '@/lib/authMiddleware';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const auth = await requireAdminOrDev(req);
  if (auth instanceof NextResponse) return auth;

  try {
    const [donations, pledges, transactions, accounts, users] = await Promise.all([
      prisma.donation.findMany({
        orderBy: { createdAt: 'desc' },
        take: 100,
        select: {
          id: true,
          donorName: true,
          donorEmail: true,
          amount: true,
          purpose: true,
          paymentMethod: true,
          razorpayPaymentId: true,
          stripeId: true,
          status: true,
          createdAt: true,
        },
      }),
      prisma.pledge.findMany({
        orderBy: { createdAt: 'desc' },
        take: 100,
        select: {
          id: true,
          donorName: true,
          donorEmail: true,
          committedAmount: true,
          paidAmount: true,
          targetDate: true,
          purpose: true,
          status: true,
          createdAt: true,
        },
      }),
      prisma.transaction.findMany({
        orderBy: { date: 'desc' },
        take: 100,
        select: {
          id: true,
          type: true,
          amount: true,
          category: true,
          description: true,
          date: true,
          account: true,
        },
      }),
      prisma.account.findMany({
        orderBy: { name: 'asc' },
        select: {
          id: true,
          name: true,
          balance: true,
          description: true,
        },
      }),
      prisma.user.findMany({
        take: 50,
        select: {
          id: true,
          name: true,
          email: true,
        },
      }),
    ]);

    return NextResponse.json({
      success: true,
      donations,
      pledges,
      transactions,
      accounts,
      users,
    });
  } catch (err: any) {
    console.error('[ADMIN/FINANCE/DATA/GET] Error:', err);
    return NextResponse.json(
      { error: err?.message || 'Database error occurred' },
      { status: 500 }
    );
  }
}
