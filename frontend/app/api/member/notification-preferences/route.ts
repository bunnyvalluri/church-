import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/authMiddleware';

export const dynamic = 'force-dynamic';

// GET /api/member/notification-preferences
export async function GET(req: Request) {
  const auth = await requireAuth(req);
  if (auth instanceof NextResponse) return auth;

  try {
    const userId = (auth as any).uid;
    const prefModel = (prisma as any).memberNotificationPreference;

    if (!prefModel) {
      return NextResponse.json({ success: true, preferences: { smsEnabled: true, emailEnabled: true, pushEnabled: true } });
    }

    let pref = await prefModel.findUnique({ where: { userId } });
    if (!pref) {
      pref = await prefModel.create({
        data: {
          userId,
          smsEnabled: true,
          emailEnabled: true,
          pushEnabled: true,
          events: true,
          sundayService: true,
          prayerMeetings: true,
          sermons: true,
          specialPrograms: true,
          donations: true,
          emergencyAlerts: true,
          youthPrograms: true,
        },
      });
    }

    return NextResponse.json({ success: true, preferences: pref });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

// POST /api/member/notification-preferences
export async function POST(req: Request) {
  const auth = await requireAuth(req);
  if (auth instanceof NextResponse) return auth;

  try {
    const userId = (auth as any).uid;
    const body = await req.json();
    const prefModel = (prisma as any).memberNotificationPreference;

    if (!prefModel) {
      return NextResponse.json({ success: true, preferences: body });
    }

    const pref = await prefModel.upsert({
      where: { userId },
      create: { userId, ...body },
      update: body,
    });

    return NextResponse.json({ success: true, preferences: pref });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
