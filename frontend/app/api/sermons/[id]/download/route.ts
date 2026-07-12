import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthenticatedUser } from '@/lib/authMiddleware';

export const dynamic = 'force-dynamic';

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  const sermonId = params.id;
  if (!sermonId) {
    return NextResponse.json({ error: 'Sermon ID is required' }, { status: 400 });
  }

  const auth = await getAuthenticatedUser(req);
  const userId = auth?.uid || null;

  try {
    const { fileType } = await req.json();
    if (!fileType || (fileType !== 'AUDIO' && fileType !== 'PDF')) {
      return NextResponse.json({ error: 'Valid fileType (AUDIO or PDF) is required' }, { status: 400 });
    }

    const ipAddress = req.headers.get('x-forwarded-for') || '';

    const download = await prisma.sermonDownload.create({
      data: {
        sermonId,
        userId,
        fileType,
        ipAddress,
      },
    });

    return NextResponse.json({ success: true, downloadId: download.id });
  } catch (err: any) {
    console.error('[API/SERMONS/DOWNLOAD] Error:', err);
    return NextResponse.json(
      { error: err?.message || 'Database error occurred while recording download' },
      { status: 500 }
    );
  }
}
