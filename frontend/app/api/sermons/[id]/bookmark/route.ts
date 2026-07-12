import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/authMiddleware';

export const dynamic = 'force-dynamic';

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  const auth = await requireAuth(req);
  if (auth instanceof NextResponse) return auth;

  const userId = auth.uid;
  const sermonId = params.id;

  if (!sermonId) {
    return NextResponse.json({ error: 'Sermon ID is required' }, { status: 400 });
  }

  try {
    const existingBookmark = await prisma.sermonBookmark.findUnique({
      where: {
        sermonId_userId: { sermonId, userId },
      },
    });

    if (existingBookmark) {
      await prisma.sermonBookmark.delete({
        where: {
          sermonId_userId: { sermonId, userId },
        },
      });
      return NextResponse.json({ success: true, bookmarked: false });
    } else {
      await prisma.sermonBookmark.create({
        data: { sermonId, userId },
      });
      return NextResponse.json({ success: true, bookmarked: true });
    }
  } catch (err: any) {
    console.error('[API/SERMONS/BOOKMARK] Error:', err);
    return NextResponse.json(
      { error: err?.message || 'Database error occurred while toggling bookmark' },
      { status: 500 }
    );
  }
}
