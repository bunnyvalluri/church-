import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthenticatedUser } from '@/lib/authMiddleware';

// Force dynamic rendering — this route reads request.url query params at runtime
export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required to fetch donation history.' }, { status: 400 });
    }

    // ── Authorization: verify the caller owns this userId ────────────────────
    // Admins may query any userId; members can only query their own.
    const authUser = await getAuthenticatedUser(req);

    // In development with NEXT_PUBLIC_DEV_AUTO_LOGIN set to a valid admin/staff role,
    // bypass Firebase ID-token verification so local development works without credentials.
    // This branch is unreachable in production (NODE_ENV === 'production').
    const devRole = process.env.NODE_ENV !== 'production'
      ? (process.env.NEXT_PUBLIC_DEV_AUTO_LOGIN?.toLowerCase() ?? '')
      : '';
    const isDevBypass = ['admin', 'super_admin', 'pastor', 'member'].includes(devRole);

    if (!isDevBypass) {
      if (!authUser) {
        return NextResponse.json(
          { error: 'Authentication required to view donation history.' },
          { status: 401 }
        );
      }

      // Members can only see their own history; admins/pastors can see anyone's
      const isAdmin = ['ADMIN', 'SUPER_ADMIN', 'PASTOR'].includes(authUser.role);
      if (!isAdmin && authUser.uid !== userId) {
        return NextResponse.json(
          { error: 'Forbidden: You can only view your own donation history.' },
          { status: 403 }
        );
      }
    }

    const donations = await prisma.donation.findMany({
      where: {
        userId,
        status: 'COMPLETED',
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({ success: true, donations });
  } catch (err: any) {
    console.error('[DONATION/HISTORY] Error:', err);
    return NextResponse.json(
      { error: err?.message || 'Database error occurred while fetching donation history' },
      { status: 500 }
    );
  }
}

