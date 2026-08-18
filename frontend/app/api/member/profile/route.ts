export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const paramUserId = searchParams.get('userId');
    const paramEmail = searchParams.get('email');

    // Extract session from cookie
    const cookieHeader = req.headers.get('cookie') || '';
    const uidMatch = cookieHeader.match(/__kcm_session_uid=([^;]+)/);
    const roleMatch = cookieHeader.match(/__kcm_session_role=([^;]+)/);
    const sessionUid = uidMatch ? uidMatch[1] : null;
    const sessionRole = roleMatch ? roleMatch[1].toUpperCase() : null;
    const isAdmin = sessionRole === 'ADMIN' || sessionRole === 'SUPER_ADMIN';

    // IDOR Protection: Non-admin users can ONLY read their own profile
    let targetUserId = paramUserId || sessionUid;
    let targetEmail = paramEmail;

    if (!isAdmin && sessionUid) {
      targetUserId = sessionUid;
      targetEmail = null; // Ignore external email param to prevent reading other users
    }

    if (!targetUserId && !targetEmail) {
      return NextResponse.json({
        success: true,
        authenticated: false,
        user: null,
        message: 'No active session or query parameters provided.'
      }, { status: 200 });
    }

    let user = null;
    if (targetUserId) {
      user = await prisma.user.findUnique({ where: { id: targetUserId } });
    }
    if (!user && targetEmail) {
      user = await prisma.user.findUnique({ where: { email: targetEmail } });
    }

    if (!user) {
      return NextResponse.json({
        success: false,
        authenticated: false,
        user: null,
        error: 'User not found'
      }, { status: 404 });
    }

    // Do not leak password hash in profile response
    const { password: _, ...sanitizedUser } = user as any;

    return NextResponse.json({
      success: true,
      authenticated: true,
      user: sanitizedUser
    }, { status: 200 });
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
    const body = await req.json();
    let { userId, email, name, phone, address, image } = body;

    // Extract session from cookie
    const cookieHeader = req.headers.get('cookie') || '';
    const uidMatch = cookieHeader.match(/__kcm_session_uid=([^;]+)/);
    const roleMatch = cookieHeader.match(/__kcm_session_role=([^;]+)/);
    const sessionUid = uidMatch ? uidMatch[1] : null;
    const sessionRole = roleMatch ? roleMatch[1].toUpperCase() : null;
    const isAdmin = sessionRole === 'ADMIN' || sessionRole === 'SUPER_ADMIN';

    // IDOR Protection: Non-admin users can ONLY modify their own profile
    let effectiveUserId = userId || sessionUid;
    if (!isAdmin && sessionUid) {
      effectiveUserId = sessionUid;
    }

    if (!effectiveUserId && !email) {
      return NextResponse.json({ error: 'User ID or Email is required for profile update' }, { status: 400 });
    }

    // Find existing user by ID or Email
    let existingUser = null;
    if (effectiveUserId) {
      existingUser = await prisma.user.findUnique({ where: { id: effectiveUserId } });
    }
    if (!existingUser && email) {
      existingUser = await prisma.user.findUnique({ where: { email: email.toLowerCase().trim() } });
    }

    const updateData: any = {
      name: name ? String(name).trim() : 'Member',
      phone: phone ? String(phone).trim() : null,
      address: address ? String(address).trim() : null,
    };
    if (image !== undefined && image !== null) {
      updateData.image = image;
    }

    let updatedUser;
    if (existingUser) {
      updatedUser = await prisma.user.update({
        where: { id: existingUser.id },
        data: updateData,
      });
    } else {
      // Create user if not present in DB
      updatedUser = await prisma.user.create({
        data: {
          id: effectiveUserId || undefined,
          email: (email || `${effectiveUserId}@kcm-church.com`).toLowerCase().trim(),
          name: name ? String(name).trim() : 'Member',
          password: '',
          phone: phone ? String(phone).trim() : null,
          address: address ? String(address).trim() : null,
          image: image || null,
          role: 'MEMBER',
        },
      });
    }

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
