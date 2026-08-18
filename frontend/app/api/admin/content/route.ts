import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdminOrDev } from '@/lib/authMiddleware';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const auth = await requireAdminOrDev(req);
  if (auth instanceof NextResponse) return auth;

  try {
    const [sermons, announcements, events] = await Promise.all([
      prisma.sermon.findMany({
        orderBy: { date: 'desc' },
        take: 50,
      }),
      prisma.announcement.findMany({
        orderBy: { createdAt: 'desc' },
        take: 50,
      }),
      prisma.event.findMany({
        orderBy: { date: 'desc' },
        take: 50,
      }),
    ]);

    return NextResponse.json({
      success: true,
      sermons,
      announcements,
      events,
    });
  } catch (err: any) {
    console.error('[ADMIN/CONTENT/GET] Error:', err);
    return NextResponse.json(
      { error: err?.message || 'Database error occurred' },
      { status: 500 }
    );
  }
}
