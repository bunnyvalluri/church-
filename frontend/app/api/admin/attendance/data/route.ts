import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdminOrDev } from '@/lib/authMiddleware';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const auth = await requireAdminOrDev(req);
  if (auth instanceof NextResponse) return auth;

  try {
    const [events, users, records, registrations] = await Promise.all([
      prisma.event.findMany({
        orderBy: { date: 'desc' },
        take: 50,
        select: {
          id: true,
          title: true,
          date: true,
          location: true,
        },
      }),
      prisma.user.findMany({
        orderBy: { name: 'asc' },
        take: 100,
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
        },
      }),
      prisma.attendanceRecord.findMany({
        orderBy: { date: 'desc' },
        take: 50,
      }),
      prisma.eventRegistration.findMany({
        select: { eventId: true, userId: true },
      }),
    ]);

    const checkins: Record<string, string[]> = {};
    for (const reg of registrations) {
      if (!checkins[reg.eventId]) {
        checkins[reg.eventId] = [];
      }
      if (reg.userId) {
        checkins[reg.eventId].push(reg.userId);
      }
    }

    return NextResponse.json({
      success: true,
      events,
      users,
      records,
      checkins,
    });
  } catch (err: any) {
    console.error('[ADMIN/ATTENDANCE/DATA/GET] Error:', err);
    return NextResponse.json(
      { error: err?.message || 'Database error occurred' },
      { status: 500 }
    );
  }
}
