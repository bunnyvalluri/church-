export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireStaffOrDev } from '@/lib/authMiddleware';

// GET all prayer requests for admin / pastoral oversight
export async function GET(req: Request) {
  try {
    const prayers = await prisma.prayerRequest.findMany({
      take: 200,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            phone: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      prayers,
    }, {
      headers: {
        'Cache-Control': 'private, no-cache, no-transform',
      },
    });
  } catch (err: any) {
    console.error('[ADMIN/PRAYERS/GET] Error:', err);
    return NextResponse.json(
      { error: err?.message || 'Database error occurred while fetching prayer requests' },
      { status: 500 }
    );
  }
}

// POST create a prayer request from admin
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { title, description, category = 'HEALTH', isAnonymous = false, userName, userEmail } = body;

    if (!title) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }

    // Identify user to associate prayer with
    let targetUserId = body.userId;
    if (!targetUserId) {
      // Find an existing admin or user
      const existingUser = await prisma.user.findFirst({
        where: userEmail ? { email: userEmail } : {},
        select: { id: true },
      });

      if (existingUser) {
        targetUserId = existingUser.id;
      } else {
        // Fallback to any existing user or create a guest profile
        const anyUser = await prisma.user.findFirst({ select: { id: true } });
        if (anyUser) {
          targetUserId = anyUser.id;
        } else {
          const createdUser = await prisma.user.create({
            data: {
              email: userEmail || `believer_${Date.now()}@kcm.org`,
              name: userName || (isAnonymous ? 'Anonymous Believer' : 'Congregation Believer'),
              password: 'kcm_believer_prayer_guest',
              role: 'MEMBER',
            },
            select: { id: true },
          });
          targetUserId = createdUser.id;
        }
      }
    }

    const prayer = await prisma.prayerRequest.create({
      data: {
        title: String(title).trim(),
        description: String(description || 'Believer prayer intercession request.').trim(),
        category: (category as any) || 'HEALTH',
        isAnonymous: Boolean(isAnonymous),
        status: 'PENDING',
        userId: targetUserId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            phone: true,
          },
        },
      },
    });

    return NextResponse.json({ success: true, prayer });
  } catch (err: any) {
    console.error('[ADMIN/PRAYERS/POST] Error:', err);
    return NextResponse.json(
      { error: err?.message || 'Failed to create prayer request' },
      { status: 500 }
    );
  }
}

// PATCH update prayer request status, category, title, description
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

    const prayer = await prisma.prayerRequest.update({
      where: { id },
      data: updateData,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            phone: true,
          },
        },
      },
    });

    return NextResponse.json({ success: true, prayer });
  } catch (err: any) {
    console.error('[ADMIN/PRAYERS/PATCH] Error:', err);
    return NextResponse.json(
      { error: err?.message || 'Failed to update prayer request' },
      { status: 500 }
    );
  }
}

// DELETE prayer request permanently
export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Prayer ID is required' }, { status: 400 });
    }

    try {
      await prisma.prayerRequest.delete({
        where: { id },
      });
    } catch (delErr: any) {
      // If already deleted, consider success
      if (delErr?.code !== 'P2025') {
        throw delErr;
      }
    }

    return NextResponse.json({ success: true, message: 'Prayer request deleted permanently' });
  } catch (err: any) {
    console.error('[ADMIN/PRAYERS/DELETE] Error:', err);
    return NextResponse.json(
      { error: err?.message || 'Failed to delete prayer request' },
      { status: 500 }
    );
  }
}
