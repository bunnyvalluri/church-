export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth, getAuthenticatedUser } from '@/lib/authMiddleware';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const queryUserId = searchParams.get('userId');

    const auth = await getAuthenticatedUser(req);
    const isAdmin = auth?.role === 'ADMIN' || auth?.role === 'SUPER_ADMIN';

    const effectiveUserId = isAdmin && queryUserId ? queryUserId : auth?.uid;

    const dbEvents = await prisma.event.findMany({
      where: {
        isDeleted: false,
        isPublished: true,
      },
      orderBy: { date: 'asc' },
    });

    let registeredIds: string[] = [];
    if (effectiveUserId && dbEvents.length > 0) {
      const registrations = await prisma.eventRegistration.findMany({
        where: { userId: effectiveUserId },
        select: { eventId: true },
      });
      registeredIds = registrations.map((r) => r.eventId);
    }

    return NextResponse.json({ success: true, events: dbEvents, registeredEventIds: registeredIds });
  } catch (err: any) {
    console.error('[EVENTS/GET] Error:', err);
    return NextResponse.json(
      { error: err?.message || 'Database error occurred while fetching events' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const auth = await requireAuth(req);
    if (auth instanceof NextResponse) return auth;

    const body = await req.json();
    const { eventId, userId } = body;

    if (!eventId) {
      return NextResponse.json({ error: 'Event ID is required' }, { status: 400 });
    }

    const isAdmin = auth.role === 'ADMIN' || auth.role === 'SUPER_ADMIN';
    const effectiveUserId = isAdmin && userId ? userId : auth.uid;

    const targetUser = await prisma.user.findUnique({ where: { id: effectiveUserId } });
    if (!targetUser) {
      return NextResponse.json({ error: 'User not found.' }, { status: 404 });
    }

    // Prevent duplicate registrations
    const existing = await prisma.eventRegistration.findUnique({
      where: {
        userId_eventId: {
          userId: effectiveUserId,
          eventId,
        },
      },
    });

    if (existing) {
      return NextResponse.json({ success: true, registration: existing, alreadyRegistered: true });
    }

    const registration = await prisma.eventRegistration.create({
      data: {
        userId: effectiveUserId,
        eventId,
        name: targetUser.name || 'Attendee',
        email: targetUser.email || 'attendee@kcm.org',
      },
    });

    return NextResponse.json({ success: true, registration });
  } catch (err: any) {
    console.error('[EVENTS/REGISTER] Error:', err);
    return NextResponse.json(
      { error: err?.message || 'Database error occurred while registering for the event' },
      { status: 500 }
    );
  }
}
