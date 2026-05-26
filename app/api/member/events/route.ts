import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import fs from 'fs';
import path from 'path';
import { getFallbackFilePath } from '@/lib/utils';

// Seed mock events for local fallback previews
const MOCK_EVENTS = [
  {
    id: 'evt_worship_sun',
    title: 'Sunday General Worship Service',
    description: 'Come join us for a powerful morning of worship, fellowship, and a life-changing sermon by Bishop Kurra Kristhu Raju Garu.',
    date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days from now
    time: '9:00 AM - 12:30 PM',
    location: 'Subhash Nagar Sanctuary',
    category: 'WORSHIP',
  },
  {
    id: 'evt_youth_camp',
    title: 'Youth Special Camp 2026',
    description: 'A special weekend retreat for all teenagers and young adults. Refresh your spirit with bible studies, worship jams, and sports.',
    date: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000).toISOString(), // 12 days from now
    time: '10:00 AM - 4:00 PM',
    location: 'Bahadurpally Hall',
    category: 'YOUTH',
  },
  {
    id: 'evt_all_night_prayer',
    title: 'All Night Prayer Vigil',
    description: 'Standing in the gap for our families, church, and nation. Fasting and corporate intercessory prayers.',
    date: new Date(Date.now() + 19 * 24 * 60 * 60 * 1000).toISOString(),
    time: '9:00 PM - 5:00 AM',
    location: 'Shapur Prayer Room',
    category: 'PRAYER',
  }
];

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    // Try database fetch first
    try {
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
    } catch (dbError: any) {
      console.warn('[EVENTS/GET] Database offline. Using local JSON fallback. Detail:', dbError?.message || dbError);

      try {
        const fallbackFile = getFallbackFilePath('fallback_events.json');
        const regFile = getFallbackFilePath('fallback_registrations.json');

        if (!fs.existsSync(fallbackFile)) {
          fs.mkdirSync(path.dirname(fallbackFile), { recursive: true });
          fs.writeFileSync(fallbackFile, JSON.stringify(MOCK_EVENTS, null, 2), 'utf-8');
        }

        const fallbackEvents = JSON.parse(fs.readFileSync(fallbackFile, 'utf-8'));

        let registeredIds: string[] = [];
        if (userId && fs.existsSync(regFile)) {
          const registrations = JSON.parse(fs.readFileSync(regFile, 'utf-8'));
          registeredIds = registrations
            .filter((r: any) => r.userId === userId)
            .map((r: any) => r.eventId);
        }

        return NextResponse.json({
          success: true,
          events: fallbackEvents,
          registeredEventIds: registeredIds,
          warning: 'Retrieved from local fallback file (DB offline).',
        });
      } catch (fsErr) {
        console.error('[EVENTS/GET] Local fallback failed:', fsErr);
        return NextResponse.json({ success: true, events: MOCK_EVENTS, registeredEventIds: [] });
      }
    }
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { userId, eventId } = body;

    if (!userId || !eventId) {
      return NextResponse.json({ error: 'User ID and Event ID are required' }, { status: 400 });
    }

    // Try Prisma DB first
    try {
      const registration = await prisma.eventRegistration.create({
        data: { userId, eventId },
      });

      return NextResponse.json({ success: true, registration });
    } catch (dbError: any) {
      console.warn('[EVENTS/REGISTER] Database offline. Using local fallback. Detail:', dbError?.message || dbError);

      try {
        const regFile = getFallbackFilePath('fallback_registrations.json');
        
        let registrations = [];
        if (fs.existsSync(regFile)) {
          registrations = JSON.parse(fs.readFileSync(regFile, 'utf-8'));
        }

        // Avoid duplicates
        const exists = registrations.some((r: any) => r.userId === userId && r.eventId === eventId);
        let newReg = null;

        if (!exists) {
          newReg = {
            id: `reg_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
            userId,
            eventId,
            createdAt: new Date().toISOString(),
          };
          registrations.push(newReg);
          const dir = path.dirname(regFile);
          if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
          }
          fs.writeFileSync(regFile, JSON.stringify(registrations, null, 2), 'utf-8');
        }

        return NextResponse.json({
          success: true,
          registration: newReg || { userId, eventId },
          warning: 'Database offline. Registration recorded in local fallback storage.',
        });
      } catch (fsErr) {
        console.error('[EVENTS/REGISTER] Local fallback failed:', fsErr);
        return NextResponse.json({ error: 'Database is offline and local fallback failed.' }, { status: 500 });
      }
    }
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Internal Server Error' }, { status: 500 });
  }
}
