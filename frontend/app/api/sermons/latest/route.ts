import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get('limit') || '6', 10);

    const sermons = await prisma.sermon.findMany({
      where: {
        isDeleted: false,
        status: 'PUBLISHED',
      },
      orderBy: { date: 'desc' },
      take: limit,
      include: {
        likes: true,
        bookmarks: true,
        _count: {
          select: {
            likes: true,
            comments: true,
            bookmarks: true,
            downloads: true,
            viewsRelation: true,
          },
        },
      },
    });

    return NextResponse.json({ success: true, sermons });
  } catch (err: any) {
    console.error('[API/SERMONS/LATEST] Error:', err);
    return NextResponse.json(
      { error: err?.message || 'Database error occurred while fetching latest sermons' },
      { status: 500 }
    );
  }
}
