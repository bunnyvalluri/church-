export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/authMiddleware';

export async function GET(req: Request) {
  try {
    const auth = await requireAuth(req);
    if (auth instanceof NextResponse) return auth;

    const { searchParams } = new URL(req.url);
    const paramUserId = searchParams.get('userId');
    const paramEmail = searchParams.get('email');

    const isAdmin = auth.role === 'ADMIN' || auth.role === 'SUPER_ADMIN';

    // IDOR Protection: Non-admin users can ONLY read their own profile
    let targetUserId = auth.uid;
    let targetEmail: string | null = null;

    if (isAdmin) {
      if (paramUserId) targetUserId = paramUserId;
      if (paramEmail) targetEmail = paramEmail;
    }

    let user = null;
    if (targetUserId) {
      user = await prisma.user.findUnique({ where: { id: targetUserId } });
    }
    if (!user && targetEmail) {
      user = await prisma.user.findUnique({ where: { email: targetEmail } });
    }

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          authenticated: false,
          user: null,
          error: 'User not found',
        },
        { status: 404 }
      );
    }

    // Do not leak password hash in profile response
    const { password: _, ...sanitizedUser } = user as any;

    return NextResponse.json(
      {
        success: true,
        authenticated: true,
        user: sanitizedUser,
      },
      { status: 200 }
    );
  } catch (err: any) {
    console.error('[PROFILE/GET] Error:', err);
    return NextResponse.json(
      { error: err?.message || 'Database error occurred while fetching profile' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const auth = await requireAuth(req);
    if (auth instanceof NextResponse) return auth;

    const body = await req.json();
    let { userId, name, phone, address, image } = body;

    const isAdmin = auth.role === 'ADMIN' || auth.role === 'SUPER_ADMIN';

    // IDOR Protection: Non-admin users can ONLY modify their own profile
    const effectiveUserId = isAdmin && userId ? userId : auth.uid;

    const existingUser = await prisma.user.findUnique({ where: { id: effectiveUserId } });
    if (!existingUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const updateData: any = {
      name: name ? String(name).trim() : existingUser.name,
      phone: phone !== undefined ? (phone ? String(phone).trim() : null) : existingUser.phone,
      address: address !== undefined ? (address ? String(address).trim() : null) : existingUser.address,
    };
    if (image !== undefined && image !== null) {
      updateData.image = image;
    }

    const updatedUser = await prisma.user.update({
      where: { id: existingUser.id },
      data: updateData,
    });

    const { password: _, ...sanitizedUser } = updatedUser as any;
    return NextResponse.json({ success: true, user: sanitizedUser });
  } catch (err: any) {
    console.error('[PROFILE/UPDATE] Error:', err);
    return NextResponse.json(
      { error: err?.message || 'Failed to update profile in database' },
      { status: 500 }
    );
  }
}
