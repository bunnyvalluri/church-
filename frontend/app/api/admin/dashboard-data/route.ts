import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdminOrDev } from '@/lib/authMiddleware';

export const dynamic = 'force-dynamic';

const USER_SELECT = {
  id: true,
  name: true,
  email: true,
  image: true,
  role: true,
  phone: true,
  address: true,
  createdAt: true,
  updatedAt: true,
  emailVerified: true,
} as const;

export async function GET(req: Request) {
  const auth = await requireAdminOrDev(req);
  if (auth instanceof NextResponse) return auth;

  try {
    const [
      users,
      donations,
      sermons,
      announcements,
      events,
      attendanceRecords,
      pledges,
      transactions,
      accounts,
    ] = await Promise.all([
      prisma.user.findMany({
        orderBy: { createdAt: 'desc' },
        take: 15,
        select: USER_SELECT,
      }),
      prisma.donation.findMany({
        orderBy: { createdAt: 'desc' },
        take: 15,
        select: {
          id: true,
          amount: true,
          currency: true,
          status: true,
          donorName: true,
          category: true,
          paymentMethod: true,
          createdAt: true,
          user: { select: { name: true, email: true } },
        },
      }),
      prisma.sermon.findMany({
        orderBy: { date: 'desc' },
        take: 15,
        select: {
          id: true,
          title: true,
          speaker: true,
          pastor: true,
          category: true,
          date: true,
          views: true,
        },
      }),
      prisma.announcement.findMany({
        orderBy: { createdAt: 'desc' },
        take: 15,
        select: {
          id: true,
          title: true,
          content: true,
          priority: true,
          createdAt: true,
        },
      }),
      prisma.event.findMany({
        orderBy: { date: 'asc' },
        take: 15,
        select: {
          id: true,
          title: true,
          date: true,
          time: true,
          location: true,
          category: true,
        },
      }),
      prisma.attendanceRecord.findMany({
        orderBy: { date: 'desc' },
        take: 15,
        select: {
          id: true,
          serviceType: true,
          headcount: true,
          newVisitors: true,
          date: true,
        },
      }),
      prisma.pledge.findMany({
        orderBy: { createdAt: 'desc' },
        take: 10,
        select: {
          id: true,
          amount: true,
          status: true,
          donorName: true,
          createdAt: true,
        },
      }),
      prisma.transaction.findMany({
        orderBy: { date: 'desc' },
        take: 10,
        select: {
          id: true,
          amount: true,
          type: true,
          description: true,
          date: true,
        },
      }),
      prisma.account.findMany({
        orderBy: { name: 'asc' },
        take: 10,
        select: {
          id: true,
          name: true,
          type: true,
          balance: true,
        },
      }),
    ]);

    return NextResponse.json(
      {
        success: true,
        users,
        donations,
        sermons,
        announcements,
        events,
        records: attendanceRecords,
        pledges,
        transactions,
        accounts,
      },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=5, stale-while-revalidate=15',
        },
      }
    );
  } catch (err: any) {
    console.error('[ADMIN/DASHBOARD-DATA/GET] Error:', err);
    return NextResponse.json(
      { error: err?.message || 'Database error occurred' },
      { status: 500 }
    );
  }
}
