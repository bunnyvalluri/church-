import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthenticatedUser } from '@/lib/authMiddleware';
import { isRateLimited } from '@/lib/rateLimit';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';

  // Rate Limiting: Max 60 queries per 15 minutes per IP
  if (isRateLimited(ip, { windowMs: 15 * 60 * 1000, maxRequests: 60 })) {
    return NextResponse.json({ error: 'Too many requests. Please try again later.' }, { status: 429 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    const status = searchParams.get('status');
    const purpose = searchParams.get('purpose');
    const limit = parseInt(searchParams.get('limit') || '10');
    const cursor = searchParams.get('cursor'); // Donation ID cursor for pagination

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required to fetch donation history.' }, { status: 400 });
    }

    // Authorization Guard
    const authUser = await getAuthenticatedUser(req);
    const devRole = process.env.NODE_ENV !== 'production'
      ? (process.env.NEXT_PUBLIC_DEV_AUTO_LOGIN?.toLowerCase() ?? '')
      : '';
    const isDevBypass = ['admin', 'super_admin', 'pastor', 'member'].includes(devRole);

    if (!isDevBypass) {
      if (!authUser) {
        return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });
      }

      const isAdmin = ['ADMIN', 'SUPER_ADMIN', 'PASTOR', 'BRANCH_MANAGER'].includes(authUser.role);
      if (!isAdmin && authUser.uid !== userId) {
        return NextResponse.json({ error: 'Forbidden: You can only view your own donation history.' }, { status: 403 });
      }
    }

    // Build Prisma query filters
    const whereClause: any = { userId };
    
    if (status) {
      whereClause.status = status as any;
    }
    
    if (purpose) {
      whereClause.purpose = purpose;
    }

    // Cursor Pagination & Fetch Query
    const queryOpts: any = {
      where: whereClause,
      take: limit + 1, // Fetch limit + 1 to check if there is a next page
      orderBy: { createdAt: 'desc' },
      include: {
        purposeRelation: true,
        branch: true,
      },
    };

    if (cursor) {
      queryOpts.cursor = { id: cursor };
      queryOpts.skip = 1; // Skip the cursor element itself
    }

    const donations = await prisma.donation.findMany(queryOpts);

    // Determine pagination cursor for next page
    let nextCursor: string | null = null;
    if (donations.length > limit) {
      const nextItem = donations[limit];
      nextCursor = nextItem.id;
      donations.pop(); // Remove the extra item used for checking
    }

    return NextResponse.json({
      success: true,
      donations,
      nextCursor,
    });
  } catch (err: any) {
    console.error('[API/DONATIONS/HISTORY] Error:', err);
    return NextResponse.json(
      { error: err?.message || 'Database error occurred.' },
      { status: 500 }
    );
  }
}
