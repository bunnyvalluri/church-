import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    const dbEvents = await prisma.event.findMany({
      orderBy: { date: 'asc' },
    });

    let registeredIds: string[] = [];
    if (userId && dbEvents.length > 0) {
      const registrations = await prisma.eventRegistration.findMany({
        where: { userId },
        select: { eventId: true },
      });
      registeredIds = registrations.map(r => r.eventId);
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
    const body = await req.json();
    const { userId, eventId } = body;

    if (!userId || !eventId) {
      return NextResponse.json({ error: 'User ID and Event ID are required' }, { status: 400 });
    }

    const registration = await prisma.eventRegistration.create({
      data: { userId, eventId },
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

