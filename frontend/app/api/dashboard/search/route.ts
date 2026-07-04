/**
 * GET /api/dashboard/search
 * ─────────────────────────────────────────────────────────────────────────────
 * Global search across Members, Events, Sermons, Announcements, Prayer Requests.
 * Query: ?q=<term>   (min 2 chars)
 *
 * Returns categorised results, max 5 per category.
 * Auth: Admin / Staff only
 */
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdminOrDev } from '@/lib/authMiddleware';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const auth = await requireAdminOrDev(req);
  if (auth instanceof NextResponse) return auth;

  const { searchParams } = new URL(req.url);
  const q = (searchParams.get('q') || '').trim();

  if (q.length < 2) {
    return NextResponse.json({ success: true, results: {}, query: q });
  }

  try {
    const contains = q;
    const mode = 'insensitive' as const;

    const [members, events, sermons, announcements, prayers] = await Promise.all([
      prisma.user.findMany({
        where: {
          OR: [
            { name: { contains, mode } },
            { email: { contains, mode } },
            { phone: { contains, mode } },
          ],
        },
        take: 5,
        select: { id: true, name: true, email: true, role: true, image: true, createdAt: true },
      }),

      prisma.event.findMany({
        where: {
          OR: [
            { title: { contains, mode } },
            { description: { contains, mode } },
            { location: { contains, mode } },
          ],
        },
        take: 5,
        select: { id: true, title: true, location: true, date: true, status: true, category: true },
      }),

      prisma.sermon.findMany({
        where: {
          OR: [
            { title: { contains, mode } },
            { pastor: { contains, mode } },
            { description: { contains, mode } },
            { category: { contains, mode } },
          ],
        },
        take: 5,
        select: { id: true, title: true, pastor: true, date: true, category: true, views: true },
      }),

      prisma.announcement.findMany({
        where: {
          OR: [
            { title: { contains, mode } },
            { content: { contains, mode } },
          ],
        },
        take: 5,
        select: { id: true, title: true, content: true, priority: true, createdAt: true },
      }),

      prisma.prayerRequest.findMany({
        where: {
          OR: [
            { title: { contains, mode } },
            { description: { contains, mode } },
          ],
        },
        take: 5,
        select: { id: true, title: true, category: true, status: true, createdAt: true },
      }),
    ]);

    return NextResponse.json({
      success: true,
      query: q,
      results: {
        members: { label: 'Members', items: members, total: members.length },
        events: { label: 'Events', items: events, total: events.length },
        sermons: { label: 'Sermons', items: sermons, total: sermons.length },
        announcements: { label: 'Announcements', items: announcements, total: announcements.length },
        prayers: { label: 'Prayer Requests', items: prayers, total: prayers.length },
      },
    });
  } catch (err: any) {
    console.error('[DASHBOARD/SEARCH/GET] Error:', err);
    return NextResponse.json({ error: err?.message || 'Internal Server Error' }, { status: 500 });
  }
}
