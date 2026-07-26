import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdminOrDev } from '@/lib/authMiddleware';

export const dynamic = 'force-dynamic';

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
}

export async function POST(req: Request) {
  const auth = await requireAdminOrDev(req);
  if (auth instanceof NextResponse) return auth;

  try {
    const body = await req.json();
    const { actionType, data } = body;

    // 1. ADD SERMON
    if (actionType === 'ADD_SERMON') {
      const { title, speaker, pastor, category, date, videoUrl, audioUrl, bibleVerse, description } = data;
      if (!title || !speaker) {
        return NextResponse.json({ error: 'Title and speaker are required' }, { status: 400 });
      }

      let slug = generateSlug(title);
      const existing = await prisma.sermon.findFirst({ where: { slug } });
      if (existing) {
        slug = `${slug}-${Math.random().toString(36).substring(2, 6)}`;
      }

      const sermon = await prisma.sermon.create({
        data: {
          title,
          slug,
          speaker,
          pastor: pastor || speaker,
          category: category || 'Faith',
          date: date ? new Date(date) : new Date(),
          videoUrl: videoUrl || null,
          audioUrl: audioUrl || null,
          bibleVerse: bibleVerse || null,
          description: description || title,
          status: 'PUBLISHED',
          visibility: 'PUBLIC',
        },
      });
      return NextResponse.json({ success: true, sermon });
    }

    // 2. DELETE SERMON
    if (actionType === 'DELETE_SERMON') {
      const { id } = data;
      await prisma.sermon.update({
        where: { id },
        data: { isDeleted: true, deletedAt: new Date() },
      });
      return NextResponse.json({ success: true });
    }

    // 3. ADD EVENT
    if (actionType === 'ADD_EVENT') {
      const { title, location, category, date, time, description, speaker } = data;
      if (!title || !location) {
        return NextResponse.json({ error: 'Title and location are required' }, { status: 400 });
      }

      let slug = generateSlug(title);
      const existing = await prisma.event.findFirst({ where: { slug } });
      if (existing) {
        slug = `${slug}-${Math.random().toString(36).substring(2, 6)}`;
      }

      const event = await prisma.event.create({
        data: {
          title,
          slug,
          location,
          category: category || 'WORSHIP',
          date: date ? new Date(date) : new Date(),
          time: time || '10:00 AM',
          description: description || title,
          speaker: speaker || null,
          status: 'PUBLISHED',
        },
      });
      return NextResponse.json({ success: true, event });
    }

    // 4. DELETE EVENT
    if (actionType === 'DELETE_EVENT') {
      const { id } = data;
      await prisma.event.update({
        where: { id },
        data: { isDeleted: true, deletedAt: new Date() },
      });
      return NextResponse.json({ success: true });
    }

    // 5. ADD ANNOUNCEMENT
    if (actionType === 'ADD_ANNOUNCEMENT') {
      const { title, content, priority, expiresAt } = data;
      if (!title || !content) {
        return NextResponse.json({ error: 'Title and content are required' }, { status: 400 });
      }

      const announcement = await prisma.announcement.create({
        data: {
          title,
          content,
          priority: priority || 'NORMAL',
          expiresAt: expiresAt ? new Date(expiresAt) : null,
        },
      });
      return NextResponse.json({ success: true, announcement });
    }

    // 6. DELETE ANNOUNCEMENT
    if (actionType === 'DELETE_ANNOUNCEMENT') {
      const { id } = data;
      await prisma.announcement.delete({
        where: { id },
      });
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Invalid action type' }, { status: 400 });
  } catch (err: any) {
    console.error('[ADMIN/CONTENT/ACTION] Error:', err);
    return NextResponse.json(
      { error: err?.message || 'Database error occurred' },
      { status: 500 }
    );
  }
}
