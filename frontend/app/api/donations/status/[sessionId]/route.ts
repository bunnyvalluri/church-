import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthenticatedUser } from '@/lib/authMiddleware';

export const dynamic = 'force-dynamic';

export async function GET(req: Request, { params }: { params: { sessionId: string } }) {
  const sessionId = params.sessionId;

  try {
    if (!sessionId) {
      return NextResponse.json({ error: 'Session ID is required.' }, { status: 400 });
    }

    const session = await prisma.donationSession.findUnique({
      where: { id: sessionId },
      include: {
        donations: {
          select: { id: true },
        },
      },
    });

    if (!session) {
      return NextResponse.json({ error: 'Donation session not found.' }, { status: 404 });
    }

    // Authorization check
    const authUser = await getAuthenticatedUser(req);
    if (session.memberId && (!authUser || authUser.uid !== session.memberId)) {
      return NextResponse.json({ error: 'Forbidden: Access denied.' }, { status: 403 });
    }

    const completedDonation = session.donations?.[0] || null;

    return NextResponse.json({
      success: true,
      status: session.status,
      sessionId: session.id,
      referenceNumber: session.referenceNumber,
      donationId: completedDonation ? completedDonation.id : null,
      expiresAt: session.expiresAt,
    });
  } catch (err: any) {
    console.error('[API/DONATIONS/STATUS] Error:', err);
    return NextResponse.json(
      { error: err.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
