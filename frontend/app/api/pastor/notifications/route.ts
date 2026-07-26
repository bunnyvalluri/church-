import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireStaffOrDev } from '@/lib/authMiddleware';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const auth = await requireStaffOrDev(req);
  if (auth instanceof NextResponse) return auth;

  try {
    const notifications = await prisma.notification.findMany({
      orderBy: { createdAt: 'desc' },
      take: 20,
    });

    return NextResponse.json({ success: true, notifications });
  } catch (err: any) {
    console.error('[PASTOR/NOTIFICATIONS/GET] Error:', err);
    return NextResponse.json({ success: true, notifications: [] });
  }
}

export async function PATCH(req: Request) {
  const auth = await requireStaffOrDev(req);
  if (auth instanceof NextResponse) return auth;

  try {
    await prisma.notification.updateMany({
      where: { isRead: false },
      data: { isRead: true }
    });

    return NextResponse.json({ success: true, message: 'All notifications marked as read' });
  } catch (err: any) {
    console.error('[PASTOR/NOTIFICATIONS/PATCH] Error:', err);
    return NextResponse.json({ error: err?.message || 'Database error' }, { status: 500 });
  }
}
