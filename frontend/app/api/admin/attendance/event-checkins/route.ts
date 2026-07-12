import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdminOrDev } from '@/lib/authMiddleware';

export const dynamic = 'force-dynamic';

// GET: Retrieve check-ins mapped by eventId
export async function GET(req: Request) {
  const auth = await requireAdminOrDev(req);
  if (auth instanceof NextResponse) return auth;

  try {
    const registrations = await prisma.eventRegistration.findMany({
      select: { eventId: true, userId: true },
    });

    const checkins: Record<string, string[]> = {};
    for (const reg of registrations) {
      if (!checkins[reg.eventId]) {
        checkins[reg.eventId] = [];
      }
      if (reg.userId) {
        checkins[reg.eventId].push(reg.userId);
      }
    }

    return NextResponse.json({ success: true, checkins });
  } catch (err: any) {
    console.error('[ADMIN/ATTENDANCE/EVENT-CHECKINS/GET] Error:', err);
    return NextResponse.json({ error: err?.message || 'Database error occurred' }, { status: 500 });
  }
}

// POST: Toggle check-in status
export async function POST(req: Request) {
  const auth = await requireAdminOrDev(req);
  if (auth instanceof NextResponse) return auth;

  try {
    const body = await req.json();
    const { eventId, userId } = body;

    if (!eventId || !userId) {
      return NextResponse.json({ error: 'eventId and userId are required' }, { status: 400 });
    }

    const existing = await prisma.eventRegistration.findUnique({
      where: {
        userId_eventId: { userId, eventId },
      },
    });

    if (existing) {
      // Toggle off: remove check-in/registration
      await prisma.eventRegistration.delete({
        where: { id: existing.id },
      });
    } else {
      // Toggle on: create check-in/registration
      const targetUser = await prisma.user.findUnique({ where: { id: userId } });
      if (!targetUser) {
        return NextResponse.json({ error: "User not found." }, { status: 404 });
      }
      await prisma.eventRegistration.create({
        data: {
          eventId,
          userId,
          name: targetUser.name || "Attendee",
          email: targetUser.email || "attendee@kcm.org",
        },
      });
    }

    // Return the updated list of checked-in user IDs for this specific event
    const eventCheckins = await prisma.eventRegistration.findMany({
      where: { eventId },
      select: { userId: true },
    });

    return NextResponse.json({
      success: true,
      checkedInUserIds: eventCheckins.map((r) => r.userId),
    });
  } catch (err: any) {
    console.error('[ADMIN/ATTENDANCE/EVENT-CHECKINS/POST] Error:', err);
    return NextResponse.json({ error: err?.message || 'Database error occurred' }, { status: 500 });
  }
}
