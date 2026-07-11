import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/* ──────────────────────────────────────────────────────────────────────────────
   GET /api/member/feedback
   Returns: live stats (avg rating, per-category breakdown, total count, recent 8)
   Poll-friendly — light DB read
────────────────────────────────────────────────────────────────────────────── */
export async function GET() {
  try {
    const [all, recent] = await Promise.all([
      prisma.churchFeedback.findMany({
        select: { rating: true, category: true, comment: true, userName: true, isAnonymous: true, createdAt: true, emoji: true },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.churchFeedback.findMany({
        where: { comment: { not: null } },
        select: { id: true, rating: true, category: true, comment: true, userName: true, isAnonymous: true, createdAt: true, emoji: true },
        orderBy: { createdAt: 'desc' },
        take: 8,
      }),
    ]);

    if (all.length === 0) {
      return NextResponse.json({
        success: true,
        stats: { total: 0, avgRating: 0, breakdown: {}, distribution: [0, 0, 0, 0, 0] },
        recent: [],
      });
    }

    // Average rating
    const avgRating = all.reduce((s, f) => s + f.rating, 0) / all.length;

    // Per-category avg
    const catMap: Record<string, { sum: number; count: number }> = {};
    for (const f of all) {
      if (!catMap[f.category]) catMap[f.category] = { sum: 0, count: 0 };
      catMap[f.category].sum += f.rating;
      catMap[f.category].count += 1;
    }
    const breakdown: Record<string, { avg: number; count: number }> = {};
    for (const [cat, { sum, count }] of Object.entries(catMap)) {
      breakdown[cat] = { avg: Math.round((sum / count) * 10) / 10, count };
    }

    // Star distribution [1★…5★]
    const distribution = [1, 2, 3, 4, 5].map(
      s => all.filter(f => f.rating === s).length,
    );

    return NextResponse.json({
      success: true,
      stats: {
        total: all.length,
        avgRating: Math.round(avgRating * 10) / 10,
        breakdown,
        distribution,
      },
      recent,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[FEEDBACK/GET]', err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

/* ──────────────────────────────────────────────────────────────────────────────
   POST /api/member/feedback
   Body: { userId?, userName?, rating, category, comment?, isAnonymous?, emoji? }
────────────────────────────────────────────────────────────────────────────── */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { userId, userName, rating, category, comment, isAnonymous, emoji } = body;

    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json({ error: 'Rating must be between 1 and 5' }, { status: 400 });
    }
    if (!category) {
      return NextResponse.json({ error: 'Category is required' }, { status: 400 });
    }

    const feedback = await prisma.churchFeedback.create({
      data: {
        userId: isAnonymous ? null : (userId ?? null),
        userName: isAnonymous ? null : (userName ?? null),
        rating: Math.round(rating),
        category,
        comment: comment?.trim() || null,
        isAnonymous: Boolean(isAnonymous),
        emoji: emoji ?? null,
      },
    });

    // Fire-and-forget notification
    try {
      const { createNotification } = await import('@/lib/notification');
      await createNotification({
        type: 'CONTACT_MESSAGE',
        title: 'New Church Feedback',
        content: `A member rated ${category} ${rating}★${comment ? ` — "${comment.substring(0, 60)}"` : ''}`,
        link: 'admin',
      });
    } catch { /* non-critical */ }

    return NextResponse.json({ success: true, feedback });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[FEEDBACK/POST]', err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
