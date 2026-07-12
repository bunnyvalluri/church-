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
        select: USER_SELECT,
      }),
      prisma.donation.findMany({
        orderBy: { createdAt: 'desc' },
        take: 50,
        include: {
          user: { select: { name: true, email: true } },
        },
      }),
      prisma.sermon.findMany({
        orderBy: { date: 'desc' },
      }),
      prisma.announcement.findMany({
        orderBy: { createdAt: 'desc' },
      }),
      prisma.event.findMany({
        orderBy: { date: 'asc' },
      }),
      prisma.attendanceRecord.findMany({
        orderBy: { date: 'desc' },
      }),
      prisma.pledge.findMany({
        orderBy: { createdAt: 'desc' },
      }),
      prisma.transaction.findMany({
        orderBy: { date: 'desc' },
      }),
      prisma.account.findMany({
        orderBy: { name: 'asc' },
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
