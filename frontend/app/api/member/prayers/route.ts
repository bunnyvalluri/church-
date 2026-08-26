export const dynamic = 'force-dynamic';
export const revalidate = 0;
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/authMiddleware';

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
    const auth = await requireAuth(req);
    if (auth instanceof NextResponse) return auth;

    const body = await req.json();
    let { title, description, category, isAnonymous } = body;

    if (!title || !description || !category) {
      return NextResponse.json({ error: 'Title, description, and category are required' }, { status: 400 });
    }

    const prayerData: any = {
      title: String(title).trim(),
      description: String(description).trim(),
      category: String(category).trim(),
      isAnonymous: Boolean(isAnonymous),
      status: 'PENDING',
      user: { connect: { id: auth.uid } },
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
        content: `${isAnonymous ? 'Anonymous' : (auth.name || 'A member')} requested prayers: "${title.substring(0, 40)}"`,
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
    const auth = await requireAuth(req);
    if (auth instanceof NextResponse) return auth;

    const body = await req.json();
    const { id, status, category, title, description } = body;

    if (!id) {
      return NextResponse.json({ error: 'Prayer ID is required' }, { status: 400 });
    }

    const isStaff = auth.role === 'ADMIN' || auth.role === 'SUPER_ADMIN' || auth.role === 'PASTOR';

    const existingPrayer = await prisma.prayerRequest.findUnique({ where: { id } });
    if (!existingPrayer) {
      return NextResponse.json({ error: 'Prayer request not found' }, { status: 404 });
    }

    // Ownership check: staff or prayer owner
    if (!isStaff && existingPrayer.userId !== auth.uid) {
      return NextResponse.json({ error: 'Forbidden: You can only edit your own prayer request' }, { status: 403 });
    }

    const updateData: any = {};
    if (status && isStaff) updateData.status = status;
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
    const auth = await requireAuth(req);
    if (auth instanceof NextResponse) return auth;

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Prayer ID is required' }, { status: 400 });
    }

    const isStaff = auth.role === 'ADMIN' || auth.role === 'SUPER_ADMIN' || auth.role === 'PASTOR';

    const existingPrayer = await prisma.prayerRequest.findUnique({ where: { id } });
    if (!existingPrayer) {
      return NextResponse.json({ error: 'Prayer request not found' }, { status: 404 });
    }

    // Ownership check: staff or prayer owner
    if (!isStaff && existingPrayer.userId !== auth.uid) {
      return NextResponse.json({ error: 'Forbidden: You can only delete your own prayer request' }, { status: 403 });
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
