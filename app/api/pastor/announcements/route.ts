import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
  try {
    const dbAnnouncements = await prisma.announcement.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ success: true, announcements: dbAnnouncements });
  } catch (err: any) {
    console.error('[PASTOR/ANNOUNCEMENT/GET] Error:', err);
    return NextResponse.json(
      { error: err?.message || 'Database error occurred while fetching announcements' },
      { status: 500 }
    );
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

    const newAnnouncement = await prisma.announcement.create({
      data: announcementData,
    });

    return NextResponse.json({ success: true, announcement: newAnnouncement });
  } catch (err: any) {
    console.error('[PASTOR/ANNOUNCEMENT/POST] Error:', err);
    return NextResponse.json(
      { error: err?.message || 'Database error occurred while creating announcement' },
      { status: 500 }
    );
  }
}

