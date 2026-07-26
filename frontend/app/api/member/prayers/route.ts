import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    const isAll = !userId || userId === 'all' || userId === 'all_admin_peek' || userId === 'admin';
    const where = isAll ? {} : { userId };

    const prayers = await prisma.prayerRequest.findMany({
      where,
      take: 100,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
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
    let { userId, title, description, category, isAnonymous } = body;

    if (!title || !description || !category) {
      return NextResponse.json({ error: 'Title, description, and category are required' }, { status: 400 });
    }

    if (!userId) {
      const firstUser = await prisma.user.findFirst();
      userId = firstUser?.id || 'admin_offline_user';
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
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
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

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { id, status, category, title, description } = body;

    if (!id) {
      return NextResponse.json({ error: 'Prayer ID is required' }, { status: 400 });
    }

    const updateData: any = {};
    if (status) updateData.status = status;
    if (category) updateData.category = category;
    if (title) updateData.title = title;
    if (description) updateData.description = description;

    const updatedPrayer = await prisma.prayerRequest.update({
      where: { id },
      data: updateData,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json({ success: true, prayer: updatedPrayer });
  } catch (err: any) {
    console.error('[PRAYERS/PATCH] Error:', err);
    return NextResponse.json(
      { error: err?.message || 'Failed to update prayer request' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Prayer ID is required' }, { status: 400 });
    }

    await prisma.prayerRequest.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, id });
  } catch (err: any) {
    console.error('[PRAYERS/DELETE] Error:', err);
    return NextResponse.json(
      { error: err?.message || 'Failed to delete prayer request' },
      { status: 500 }
    );
  }
}


