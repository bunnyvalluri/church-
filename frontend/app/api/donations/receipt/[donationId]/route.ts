import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  req: Request,
  { params }: { params: { donationId: string } }
) {
  const { donationId } = params;

  if (!donationId) {
    return NextResponse.json({ error: 'Donation ID is required' }, { status: 400 });
  }

  try {
    const donation = await prisma.donation.findUnique({
      where: { id: donationId },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    if (!donation) {
      return NextResponse.json({ error: 'Donation record not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, donation });
  } catch (dbError: any) {
    console.error(`[DONATION/RECEIPT] Database error for ${donationId}:`, dbError);
    return NextResponse.json(
      { error: dbError?.message || 'Database error occurred while fetching donation receipt' },
      { status: 500 }
    );
  }
}

