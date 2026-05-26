import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import fs from 'fs';
import path from 'path';

export async function GET(
  req: Request,
  { params }: { params: { donationId: string } }
) {
  const { donationId } = params;

  if (!donationId) {
    return NextResponse.json({ error: 'Donation ID is required' }, { status: 400 });
  }

  // Try database lookup first
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
    console.warn(`[DONATION/RECEIPT] Database lookup failed for ${donationId}. Using fallback JSON. Detail:`, dbError?.message || dbError);

    try {
      const fallbackFile = path.join(process.cwd(), 'prisma', 'fallback_donations.json');
      
      if (!fs.existsSync(fallbackFile)) {
        return NextResponse.json({ error: 'Donation record not found (fallback file missing)' }, { status: 404 });
      }

      const donations = JSON.parse(fs.readFileSync(fallbackFile, 'utf-8'));
      const donation = donations.find((d: any) => d.id === donationId);

      if (!donation) {
        return NextResponse.json({ error: 'Donation record not found in local fallback' }, { status: 404 });
      }

      // Format response to mock Prisma response (nested user property if possible)
      const formattedDonation = {
        ...donation,
        user: donation.userId ? { name: donation.donorName, email: donation.donorEmail } : null,
      };

      return NextResponse.json({
        success: true,
        donation: formattedDonation,
        warning: 'Retrieved from local fallback file (DB offline).',
      });
    } catch (fsErr) {
      console.error('[DONATION/RECEIPT] Fallback reading failed:', fsErr);
      return NextResponse.json({
        error: 'Database offline and local fallback lookup failed.',
        details: dbError?.message || String(dbError),
      }, { status: 500 });
    }
  }
}
