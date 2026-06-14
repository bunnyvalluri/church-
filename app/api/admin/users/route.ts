import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdminOrDev } from '@/lib/authMiddleware';
import fs from 'fs';
import path from 'path';

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

function getFallbackFilePath() {
  if (process.env.VERCEL || process.env.NODE_ENV === 'production') {
    return path.join('/tmp', 'fallback_users.json');
  }
  return path.join(process.cwd(), 'prisma', 'fallback_users.json');
}

export async function GET(req: Request) {
  // ── Auth Guard ─────────────────────────────────────────────────────────────
  const auth = await requireAdminOrDev(req);
  if (auth instanceof NextResponse) return auth;

  try {
    // Try database fetch first
    try {
      const dbUsers = await prisma.user.findMany({
        orderBy: { createdAt: 'desc' },
        select: USER_SELECT,
      });

      return NextResponse.json({ success: true, users: dbUsers });
    } catch (dbError: any) {
      console.warn('[ADMIN/USERS/GET] Database offline. Using local JSON fallback. Detail:', dbError?.message || dbError);

      try {
        const fallbackFile = getFallbackFilePath();
        
        if (!fs.existsSync(fallbackFile)) {
          return NextResponse.json({ success: true, users: [] });
        }

        const users = JSON.parse(fs.readFileSync(fallbackFile, 'utf-8'));
        const sortedUsers = users.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

        return NextResponse.json({
          success: true,
          users: sortedUsers,
          warning: 'Retrieved from local fallback file (DB offline).',
        });
      } catch (fsErr) {
        console.error('[ADMIN/USERS/GET] Local fallback failed:', fsErr);
        return NextResponse.json({ success: true, users: [] });
      }
    }
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Internal Server Error' }, { status: 500 });
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

      // Try database insert first
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
        console.warn('[ADMIN/USERS/CREATE] Database offline. Using local fallback. Detail:', dbError?.message || dbError);

        try {
          const fallbackFile = getFallbackFilePath();
          
          let users = [];
          if (fs.existsSync(fallbackFile)) {
            users = JSON.parse(fs.readFileSync(fallbackFile, 'utf-8'));
          }

          const cleanEmail = email.toLowerCase().trim();
          if (users.some((u: any) => u.email === cleanEmail)) {
            return NextResponse.json({ error: 'User with this email already exists' }, { status: 400 });
          }

          const newUser = {
            id: `usr_${Date.now()}`,
            email: cleanEmail,
            name: name || 'Member',
            image: null,
            phone: phone || null,
            role: userRole,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          users.push(newUser);

          // Ensure directories exist
          const dir = path.dirname(fallbackFile);
          if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
          }

          fs.writeFileSync(fallbackFile, JSON.stringify(users, null, 2), 'utf-8');

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

          return NextResponse.json({
            success: true,
            user: newUser,
            warning: 'Database offline. User created in local fallback storage.',
          });
        } catch (fsErr) {
          console.error('[ADMIN/USERS/CREATE] Local fallback failed:', fsErr);
          return NextResponse.json({ error: 'Database is offline and local fallback failed.' }, { status: 500 });
        }
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

    // Try database update first
    try {
      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: { role: newRole },
        select: USER_SELECT,
      });

      return NextResponse.json({ success: true, user: updatedUser });
    } catch (dbError: any) {
      console.warn('[ADMIN/USERS/UPDATE] Database offline. Using local fallback. Detail:', dbError?.message || dbError);

      try {
        const fallbackFile = getFallbackFilePath();
        
        let users = [];
        if (fs.existsSync(fallbackFile)) {
          users = JSON.parse(fs.readFileSync(fallbackFile, 'utf-8'));
        }

        let found = false;
        users = users.map((u: any) => {
          if (u.id === userId) {
            found = true;
            return {
              ...u,
              role: newRole,
              updatedAt: new Date().toISOString(),
            };
          }
          return u;
        });

        if (!found) {
          // Create fallback user if not found
          const newUser = {
            id: userId,
            email: `user_${userId.substring(0, 5)}@fallback.com`,
            name: 'Member',
            role: newRole,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          users.push(newUser);
        }

        // Ensure directories exist
        const dir = path.dirname(fallbackFile);
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir, { recursive: true });
        }

        fs.writeFileSync(fallbackFile, JSON.stringify(users, null, 2), 'utf-8');
        const updatedFallbackUser = users.find((u: any) => u.id === userId);

        return NextResponse.json({
          success: true,
          user: updatedFallbackUser,
          warning: 'Database offline. Role updated in local fallback storage.',
        });
      } catch (fsErr) {
        console.error('[ADMIN/USERS/UPDATE] Local fallback failed:', fsErr);
        return NextResponse.json({ error: 'Database is offline and local fallback failed.' }, { status: 500 });
      }
    }
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Internal Server Error' }, { status: 500 });
  }
}
