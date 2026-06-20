import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdminOrDev } from '@/lib/authMiddleware';

// Safe user fields — NEVER expose password hash
const USER_SELECT = {
  id: true,
  name: true,
  email: true,
  image: true,
  role: true,
  phone: true,
  address: true,
  createdAt: true,
  updatedAt: true,
  emailVerified: true,
} as const;

export async function GET(req: Request) {
  // ── Auth Guard ─────────────────────────────────────────────────────────────
  const auth = await requireAdminOrDev(req);
  if (auth instanceof NextResponse) return auth;

  try {
    const dbUsers = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      select: USER_SELECT,
    });

    return NextResponse.json({ success: true, users: dbUsers });
  } catch (err: any) {
    console.error('[ADMIN/USERS/GET] Error:', err);
    return NextResponse.json(
      { error: err?.message || 'Database error occurred' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  // ── Auth Guard — only SUPER_ADMIN or ADMIN/DEV can manage users ───────────
  const auth = await requireAdminOrDev(req);
  if (auth instanceof NextResponse) return auth;

  try {
    const body = await req.json();

    // Check if we are creating a user
    if (body.action === 'create') {
      const { name, email, phone, role } = body;

      if (!email) {
        return NextResponse.json({ error: 'Email is required' }, { status: 400 });
      }

      const userRole = role || 'MEMBER';
      if (!['MEMBER', 'PASTOR', 'ADMIN', 'SUPER_ADMIN'].includes(userRole)) {
        return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
      }

      // Prevent privilege escalation: only SUPER_ADMIN can grant SUPER_ADMIN
      if (userRole === 'SUPER_ADMIN' && auth.role !== 'SUPER_ADMIN') {
        return NextResponse.json({ error: 'Only SUPER_ADMIN can grant SUPER_ADMIN role.' }, { status: 403 });
      }

      try {
        const newUser = await prisma.user.create({
          data: {
            name: name || 'Member',
            email: email.toLowerCase().trim(),
            phone: phone || null,
            role: userRole,
            password: 'admin-created', // placeholder password
          },
          select: USER_SELECT,
        });

        // Trigger notification
        try {
          const { createNotification } = await import('@/lib/notification');
          await createNotification({
            type: 'NEW_MEMBER',
            title: 'New Member Registered',
            content: `${name || 'A new member'} (${email}) registered by Admin.`,
            link: 'members',
          });
        } catch (notifErr) {
          console.warn('[ADMIN/USERS/CREATE] Notification creation failed:', notifErr);
        }

        return NextResponse.json({ success: true, user: newUser });
      } catch (dbError: any) {
        console.error('[ADMIN/USERS/CREATE] Database error:', dbError);
        return NextResponse.json(
          { error: dbError?.message || 'Database error occurred while creating user' },
          { status: 500 }
        );
      }
    }

    // Role modification (default behavior)
    const { userId, newRole } = body;

    if (!userId || !newRole) {
      return NextResponse.json({ error: 'User ID and new role are required' }, { status: 400 });
    }

    if (!['MEMBER', 'PASTOR', 'ADMIN', 'SUPER_ADMIN'].includes(newRole)) {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
    }

    // Prevent privilege escalation: only SUPER_ADMIN can grant SUPER_ADMIN
    if (newRole === 'SUPER_ADMIN' && auth.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Only SUPER_ADMIN can grant SUPER_ADMIN role.' }, { status: 403 });
    }

    try {
      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: { role: newRole },
        select: USER_SELECT,
      });

      return NextResponse.json({ success: true, user: updatedUser });
    } catch (dbError: any) {
      console.error('[ADMIN/USERS/UPDATE] Database error:', dbError);
      return NextResponse.json(
        { error: dbError?.message || 'Database error occurred while updating user role' },
        { status: 500 }
      );
    }
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  // ── Auth Guard ─────────────────────────────────────────────────────────────
  const auth = await requireAdminOrDev(req);
  if (auth instanceof NextResponse) return auth;

  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('id');

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    // 1. Fetch user to verify permissions and role
    const targetUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, role: true },
    });

    if (!targetUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // 2. Prevent self-deletion
    if (auth.uid === targetUser.id || auth.email.toLowerCase() === targetUser.email.toLowerCase()) {
      return NextResponse.json({ error: 'Self-deletion is not permitted' }, { status: 400 });
    }

    // 3. Limit deletion of admins to SUPER_ADMIN
    if ((targetUser.role === 'ADMIN' || targetUser.role === 'SUPER_ADMIN') && auth.role !== 'SUPER_ADMIN') {
      return NextResponse.json(
        { error: 'Only SUPER_ADMIN can delete administrative users.' },
        { status: 403 }
      );
    }

    // 4. Nullify userId in related Donation records to preserve financial history and avoid FK violation
    await prisma.donation.updateMany({
      where: { userId: targetUser.id },
      data: { userId: null },
    });

    // 5. Delete the user
    await prisma.user.delete({
      where: { id: targetUser.id },
    });

    return NextResponse.json({ success: true, message: 'User deleted successfully' });
  } catch (err: any) {
    console.error('[ADMIN/USERS/DELETE] Error:', err);
    return NextResponse.json(
      { error: err?.message || 'Database error occurred while deleting user' },
      { status: 500 }
    );
  }
}


