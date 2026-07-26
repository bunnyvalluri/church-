import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const prayers = await prisma.prayerRequest.findMany({
      orderBy: { createdAt: 'desc' },
      take: 100,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
    });
    return NextResponse.json({ success: true, prayers });
  } catch (err: any) {
    console.error('[PASTOR/PRAYER-REQUESTS/GET] Error:', err);
    return NextResponse.json(
      { error: err?.message || 'Database error occurred while fetching prayer requests' },
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { id, status } = body;

    if (!id || !status) {
      return NextResponse.json({ error: 'Prayer ID and status are required' }, { status: 400 });
    }

    const prayer = await prisma.prayerRequest.update({
      where: { id },
      data: { status },
    });

    return NextResponse.json({ success: true, prayer });
  } catch (err: any) {
    console.error('[PASTOR/PRAYER-REQUESTS/PATCH] Error:', err);
    return NextResponse.json(
      { error: err?.message || 'Failed to update prayer request status' },
      { status: 500 }
    );
  }
}
