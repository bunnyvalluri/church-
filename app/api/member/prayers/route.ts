import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const prayers = await prisma.prayerRequest.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ success: true, prayers });
  } catch (err: any) {
    console.error('[PRAYERS/GET] Error:', err);
    return NextResponse.json(
      { error: err?.message || 'Database error occurred while fetching prayer requests' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { userId, title, description, category, isAnonymous } = body;

    if (!userId || !title || !description || !category) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }

    const prayerData = {
      userId,
      title,
      description,
      category,
      isAnonymous: Boolean(isAnonymous),
      status: 'PENDING' as const,
    };

    const newPrayer = await prisma.prayerRequest.create({
      data: prayerData,
    });

    // Trigger notification
    try {
      const { createNotification } = await import('@/lib/notification');
      await createNotification({
        type: 'PRAYER_REQUEST',
        title: 'New Prayer Request',
        content: `${isAnonymous ? 'Anonymous' : 'A member'} requested prayers: "${title.substring(0, 40)}"`,
        link: 'prayers',
      });
    } catch (notifErr) {
      console.warn('[PRAYERS/CREATE] Notification creation failed:', notifErr);
    }

    return NextResponse.json({ success: true, prayer: newPrayer });
  } catch (err: any) {
    console.error('[PRAYERS/CREATE] Error:', err);
    return NextResponse.json(
      { error: err?.message || 'Database error occurred while submitting prayer request' },
      { status: 500 }
    );
  }
}

