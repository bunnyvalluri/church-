import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import fs from 'fs';
import path from 'path';

export async function GET(req: Request) {
  try {
    // Try database fetch first
    try {
      const dbAnnouncements = await prisma.announcement.findMany({
        orderBy: { createdAt: 'desc' },
      });

      return NextResponse.json({ success: true, announcements: dbAnnouncements });
    } catch (dbError: any) {
      console.warn('[PASTOR/ANNOUNCEMENT/GET] Database offline. Using local JSON fallback. Detail:', dbError?.message || dbError);

      try {
        const fallbackFile = path.join(process.cwd(), 'prisma', 'fallback_announcements.json');
        
        if (!fs.existsSync(fallbackFile)) {
          // If no fallback file exists, return seed announcements so the dashboard has rich mock data
          const seed = [
            { id: '1', title: 'Sunday Worship Reschedule', content: 'Our main worship service will start at 9:00 AM instead of 10:00 AM this Sunday only.', priority: 'HIGH', createdAt: new Date().toISOString() },
            { id: '2', title: 'Youth Spiritual Fellowship', content: 'Weekly youth meetups every Friday night at Bahadurpally location. Join us for fellowship and study.', priority: 'NORMAL', createdAt: new Date().toISOString() }
          ];
          fs.writeFileSync(fallbackFile, JSON.stringify(seed, null, 2), 'utf-8');
          return NextResponse.json({ success: true, announcements: seed, warning: 'Seeded initial local announcements.' });
        }

        const announcements = JSON.parse(fs.readFileSync(fallbackFile, 'utf-8'));
        const sorted = announcements.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

        return NextResponse.json({
          success: true,
          announcements: sorted,
          warning: 'Retrieved from local fallback file (DB offline).',
        });
      } catch (fsErr) {
        console.error('[PASTOR/ANNOUNCEMENT/GET] Local fallback failed:', fsErr);
        return NextResponse.json({ success: true, announcements: [] });
      }
    }
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { title, content, priority } = body;

    if (!title || !content) {
      return NextResponse.json({ error: 'Title and content are required' }, { status: 400 });
    }

    const announcementData = {
      title,
      content,
      priority: priority || 'NORMAL',
    };

    // Try database insertion first
    try {
      const newAnnouncement = await prisma.announcement.create({
        data: announcementData,
      });

      return NextResponse.json({ success: true, announcement: newAnnouncement });
    } catch (dbError: any) {
      console.warn('[PASTOR/ANNOUNCEMENT] Database offline. Using fallback JSON storage. Detail:', dbError?.message || dbError);

      try {
        const fallbackFile = path.join(process.cwd(), 'prisma', 'fallback_announcements.json');
        
        let announcements = [];
        if (fs.existsSync(fallbackFile)) {
          announcements = JSON.parse(fs.readFileSync(fallbackFile, 'utf-8'));
        }

        const newAnnouncementFallback = {
          id: `anc_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
          ...announcementData,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        announcements.push(newAnnouncementFallback);
        fs.writeFileSync(fallbackFile, JSON.stringify(announcements, null, 2), 'utf-8');

        return NextResponse.json({
          success: true,
          announcement: newAnnouncementFallback,
          warning: 'Database offline. Announcement saved in local fallback storage.',
        });
      } catch (fsErr) {
        console.error('[PASTOR/ANNOUNCEMENT] Local fallback failed:', fsErr);
        return NextResponse.json({ error: 'Database is offline and local fallback failed.' }, { status: 500 });
      }
    }
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Internal Server Error' }, { status: 500 });
  }
}
