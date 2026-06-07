import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import fs from 'fs';
import path from 'path';

function getFallbackFilePath() {
  if (process.env.VERCEL || process.env.NODE_ENV === 'production') {
    return path.join('/tmp', 'fallback_users.json');
  }
  return path.join(process.cwd(), 'prisma', 'fallback_users.json');
}

export async function GET(req: Request) {
  try {
    // Try database fetch first
    try {
      const dbUsers = await prisma.user.findMany({
        orderBy: { createdAt: 'desc' },
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
  try {
    const body = await req.json();
    const { userId, newRole } = body;

    if (!userId || !newRole) {
      return NextResponse.json({ error: 'User ID and new role are required' }, { status: 400 });
    }

    if (!['MEMBER', 'PASTOR', 'ADMIN', 'SUPER_ADMIN'].includes(newRole)) {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
    }

    // Try database update first
    try {
      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: { role: newRole },
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
