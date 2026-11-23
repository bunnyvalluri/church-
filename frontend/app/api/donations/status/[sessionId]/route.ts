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

    const completedDonation = session.donations?.[0] || null;
    let receiptNumber = null;
    if (completedDonation) {
      const receipt = await prisma.receipt.findUnique({
        where: { donationId: completedDonation.id },
        select: { receiptNumber: true },
      });
      receiptNumber = receipt?.receiptNumber || null;
    }

    return NextResponse.json({
      success: true,
      status: session.status,
      sessionId: session.id,
      referenceNumber: session.referenceNumber,
      donationId: completedDonation ? completedDonation.id : null,
      receiptNumber,
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
