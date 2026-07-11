import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const purposes = await prisma.donationPurpose.findMany({
      where: { isActive: true, isArchived: false },
      orderBy: { sortOrder: 'asc' },
    });
    return NextResponse.json({ success: true, purposes });
  } catch (err: any) {
    console.error('[API/DONATIONS/PURPOSES] Error:', err);
    return NextResponse.json(
      { error: err.message || 'Failed to load purposes' },
      { status: 500 }
    );
  }
}
