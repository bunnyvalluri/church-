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
        take: 50,
        select: USER_SELECT,
      }),
      prisma.donation.findMany({
        orderBy: { createdAt: 'desc' },
        take: 30,
        include: {
          user: { select: { name: true, email: true } },
        },
      }),
      prisma.sermon.findMany({
        orderBy: { date: 'desc' },
        take: 20,
      }),
      prisma.announcement.findMany({
        orderBy: { createdAt: 'desc' },
        take: 20,
      }),
      prisma.event.findMany({
        orderBy: { date: 'asc' },
        take: 20,
      }),
      prisma.attendanceRecord.findMany({
        orderBy: { date: 'desc' },
        take: 30,
      }),
      prisma.pledge.findMany({
        orderBy: { createdAt: 'desc' },
        take: 20,
      }),
      prisma.transaction.findMany({
        orderBy: { date: 'desc' },
        take: 30,
      }),
      prisma.account.findMany({
        orderBy: { name: 'asc' },
        take: 20,
      }),
    ]);

    return NextResponse.json({
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
    });
  } catch (err: any) {
    console.error('[ADMIN/DASHBOARD-DATA/GET] Error:', err);
    return NextResponse.json(
      { error: err?.message || 'Database error occurred' },
      { status: 500 }
    );
  }
}
