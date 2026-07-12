import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireEventManagerOrDev } from '@/lib/authMiddleware';

export const dynamic = 'force-dynamic';

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  const auth = await requireEventManagerOrDev(req);
  if (auth instanceof NextResponse) return auth;

  try {
    const sermonId = params.id;
    if (!sermonId) {
      return NextResponse.json({ error: 'Sermon ID is required' }, { status: 400 });
    }

    const originalSermon = await prisma.sermon.findUnique({
      where: { id: sermonId },
    });

    if (!originalSermon) {
      return NextResponse.json({ error: 'Sermon not found' }, { status: 404 });
    }

    // Generate unique slug
    let newTitle = `${originalSermon.title} (Copy)`;
    let newSlug = originalSermon.slug + '-copy';
    const existingSlug = await prisma.sermon.findFirst({ where: { slug: newSlug } });
    if (existingSlug) {
      newSlug = `${newSlug}-${Math.random().toString(36).substring(2, 6)}`;
    }

    const duplicatedSermon = await prisma.sermon.create({
      data: {
        title: newTitle,
        slug: newSlug,
        subtitle: originalSermon.subtitle,
        shortDescription: originalSermon.shortDescription,
        description: originalSermon.description,
        bibleVerse: originalSermon.bibleVerse,
        book: originalSermon.book,
        chapter: originalSermon.chapter,
        verses: originalSermon.verses,
        speaker: originalSermon.speaker,
        pastor: originalSermon.pastor,
        guestSpeaker: originalSermon.guestSpeaker,
        branch: originalSermon.branch,
        category: originalSermon.category,
        language: originalSermon.language,
        date: new Date(),
        duration: originalSermon.duration,
        tags: originalSermon.tags,
        keywords: originalSermon.keywords,
        thumbnail: originalSermon.thumbnail,
        thumbnailPublicId: originalSermon.thumbnailPublicId,
        banner: originalSermon.banner,
        bannerPublicId: originalSermon.bannerPublicId,
        videoUrl: originalSermon.videoUrl,
        videoPublicId: originalSermon.videoPublicId,
        audioUrl: originalSermon.audioUrl,
        audioPublicId: originalSermon.audioPublicId,
        pdfUrl: originalSermon.pdfUrl,
        pdfPublicId: originalSermon.pdfPublicId,
        presentationUrl: originalSermon.presentationUrl,
        presentationPublicId: originalSermon.presentationPublicId,
        featured: false,
        recommended: false,
        visibility: originalSermon.visibility,
        status: 'DRAFT', // Always duplicate as draft
        seoTitle: `Copy of ${originalSermon.seoTitle || originalSermon.title}`,
        seoDescription: originalSermon.seoDescription,
        createdById: auth.uid || null,
      },
    });

    // Real-time companion broadcast
    const companionUrl = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001';
    try {
      await fetch(`${companionUrl}/api/trigger-event`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'sermon.created',
          payload: {
            id: duplicatedSermon.id,
            title: duplicatedSermon.title,
            slug: duplicatedSermon.slug,
            speaker: duplicatedSermon.speaker,
            category: duplicatedSermon.category,
            thumbnail: duplicatedSermon.thumbnail,
            status: duplicatedSermon.status,
            date: duplicatedSermon.date,
          },
        }),
      });
    } catch (socketErr) {
      console.warn('[API/SERMONS/[ID]/DUPLICATE] Socket companion broadcast failed:', socketErr);
    }

    return NextResponse.json({ success: true, sermon: duplicatedSermon });
  } catch (err: any) {
    console.error('[API/SERMONS/[ID]/DUPLICATE] Error:', err);
    return NextResponse.json(
      { error: err?.message || 'Database error occurred while duplicating sermon' },
      { status: 500 }
    );
  }
}
