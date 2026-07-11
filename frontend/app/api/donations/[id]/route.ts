import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthenticatedUser } from '@/lib/authMiddleware';

export const dynamic = 'force-dynamic';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const id = params.id;

  try {
    if (!id) {
      return NextResponse.json({ error: 'Donation ID is required.' }, { status: 400 });
    }

    // 1. Fetch the donation record
    const donation = await prisma.donation.findUnique({
      where: { id },
      include: {
        purposeRelation: true,
        branch: true,
        receipt: true,
      },
    });

    if (!donation) {
      return NextResponse.json({ error: 'Donation record not found.' }, { status: 404 });
    }

    // 2. Authorization check: must be either the owner of the donation or an admin
    const authUser = await getAuthenticatedUser(req);
    const devRole = process.env.NODE_ENV !== 'production'
      ? (process.env.NEXT_PUBLIC_DEV_AUTO_LOGIN?.toLowerCase() ?? '')
      : '';
    const isDevBypass = ['admin', 'super_admin', 'pastor'].includes(devRole);

    if (!isDevBypass) {
      if (!authUser) {
        return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });
      }

      const isAdmin = ['ADMIN', 'SUPER_ADMIN', 'PASTOR', 'BRANCH_MANAGER'].includes(authUser.role);
      if (!isAdmin && donation.userId && authUser.uid !== donation.userId) {
        return NextResponse.json({ error: 'Forbidden: You do not have access to view this donation.' }, { status: 403 });
      }
    }

    return NextResponse.json({
      success: true,
      donation,
    });
  } catch (err: any) {
    console.error('[API/DONATIONS/GET-BY-ID] Error:', err);
    return NextResponse.json(
      { error: err.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
