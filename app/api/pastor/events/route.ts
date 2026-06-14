import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { title, description, date, time, location, category } = body;

    if (!title || !description || !date || !time || !location || !category) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }

    const eventData = {
      title,
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

