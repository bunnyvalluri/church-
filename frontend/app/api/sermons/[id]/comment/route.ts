import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/authMiddleware';

export const dynamic = 'force-dynamic';

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const sermonId = params.id;
  if (!sermonId) {
    return NextResponse.json({ error: 'Sermon ID is required' }, { status: 400 });
  }

  try {
    const comments = await prisma.sermonComment.findMany({
      where: { sermonId, isDeleted: false },
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: { id: true, name: true, image: true },
        },
      },
    });

    return NextResponse.json({ success: true, comments });
  } catch (err: any) {
    console.error('[API/SERMONS/COMMENT/GET] Error:', err);
    return NextResponse.json(
      { error: err?.message || 'Database error occurred while fetching comments' },
      { status: 500 }
    );
  }
}

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
    const { content } = await req.json();
    if (!content || !content.trim()) {
      return NextResponse.json({ error: 'Comment content is required' }, { status: 400 });
    }

    const comment = await prisma.sermonComment.create({
      data: {
        sermonId,
        userId,
        content: content.trim(),
      },
      include: {
        user: {
          select: { id: true, name: true, image: true },
        },
      },
    });

    return NextResponse.json({ success: true, comment });
  } catch (err: any) {
    console.error('[API/SERMONS/COMMENT/POST] Error:', err);
    return NextResponse.json(
      { error: err?.message || 'Database error occurred while posting comment' },
      { status: 500 }
    );
  }
}
