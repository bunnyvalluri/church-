import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdminOrDev } from '@/lib/authMiddleware';


export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { title, description, date, time, location, category } = body;

    if (!title || !description || !date || !time || !location || !category) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }

    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + '-' + Math.random().toString(36).substring(2, 6);
    const eventData = {
      title,
      slug,
      description,
      date: new Date(date).toISOString(),
      time,
      location,
      category,
    };

    const newEvent = await prisma.event.create({
      data: eventData,
    });

    return NextResponse.json({ success: true, event: newEvent });
  } catch (err: any) {
    console.error('[PASTOR/EVENTS] Error:', err);
    return NextResponse.json(
      { error: err?.message || 'Database error occurred while creating event' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  // ── Auth Guard ─────────────────────────────────────────────────────────────
  const auth = await requireAdminOrDev(req);
  if (auth instanceof NextResponse) return auth;

  try {
    const { searchParams } = new URL(req.url);
    const eventId = searchParams.get('id');

    if (!eventId) {
      return NextResponse.json({ error: 'Event ID is required' }, { status: 400 });
    }

    await prisma.event.delete({
      where: { id: eventId },
    });

    return NextResponse.json({ success: true, message: 'Event deleted successfully' });
  } catch (err: any) {
    console.error('[PASTOR/EVENTS/DELETE] Error:', err);
    return NextResponse.json(
      { error: err?.message || 'Database error occurred while deleting event' },
      { status: 500 }
    );
  }
}


