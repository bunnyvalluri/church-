import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireStaffOrDev } from '@/lib/authMiddleware';

/**
 * GET /api/pastor/members
 * Returns a summary of members (count + basic info) accessible to PASTOR role.
 * Full user management (edit/delete) remains admin-only via /api/admin/users.
 */
export async function GET(req: Request) {
  const auth = await requireStaffOrDev(req);
  if (auth instanceof NextResponse) return auth;

  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        phone: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ success: true, users, total: users.length });
  } catch (err: any) {
    console.error('[PASTOR/MEMBERS/GET] Error:', err);
    return NextResponse.json(
      { error: err?.message || 'Database error occurred' },
      { status: 500 }
    );
  }
}
