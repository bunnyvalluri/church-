import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import fs from 'fs';
import path from 'path';

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

    // Try database insertion first
    try {
      const newEvent = await prisma.event.create({
        data: eventData,
      });

      return NextResponse.json({ success: true, event: newEvent });
    } catch (dbError: any) {
      console.warn('[PASTOR/EVENTS] Database offline. Using fallback JSON storage. Detail:', dbError?.message || dbError);

      try {
        const fallbackFile = path.join(process.cwd(), 'prisma', 'fallback_events.json');
        
        let events = [];
        if (fs.existsSync(fallbackFile)) {
          events = JSON.parse(fs.readFileSync(fallbackFile, 'utf-8'));
        }

        const newEventFallback = {
          id: `evt_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
          ...eventData,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        events.push(newEventFallback);
        fs.writeFileSync(fallbackFile, JSON.stringify(events, null, 2), 'utf-8');

        return NextResponse.json({
          success: true,
          event: newEventFallback,
          warning: 'Database offline. Event saved in local fallback storage.',
        });
      } catch (fsErr) {
        console.error('[PASTOR/EVENTS] Local fallback failed:', fsErr);
        return NextResponse.json({ error: 'Database is offline and local fallback failed.' }, { status: 500 });
      }
    }
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Internal Server Error' }, { status: 500 });
  }
}
