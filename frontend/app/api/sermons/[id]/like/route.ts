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
    const existingLike = await prisma.sermonLike.findUnique({
      where: {
        sermonId_userId: { sermonId, userId },
      },
    });

    if (existingLike) {
      await prisma.sermonLike.delete({
        where: {
          sermonId_userId: { sermonId, userId },
        },
      });
      return NextResponse.json({ success: true, liked: false });
    } else {
      await prisma.sermonLike.create({
        data: { sermonId, userId },
      });
      return NextResponse.json({ success: true, liked: true });
    }
  } catch (err: any) {
    console.error('[API/SERMONS/LIKE] Error:', err);
    return NextResponse.json(
      { error: err?.message || 'Database error occurred while toggling like' },
      { status: 500 }
    );
  }
}
