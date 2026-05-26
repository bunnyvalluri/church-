import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import fs from 'fs';
import path from 'path';

// Force dynamic rendering — this route reads request.url query params at runtime
export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required to fetch donation history.' }, { status: 400 });
    }

    // Try database query first
    try {
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
    } catch (dbError: any) {
      console.warn(`[DONATION/HISTORY] Database lookup failed for user ${userId}. Using fallback JSON. Detail:`, dbError?.message || dbError);

      try {
        const fallbackFile = path.join(process.cwd(), 'prisma', 'fallback_donations.json');
        
        if (!fs.existsSync(fallbackFile)) {
          return NextResponse.json({ success: true, donations: [] });
        }

        const allDonations = JSON.parse(fs.readFileSync(fallbackFile, 'utf-8'));
        
        // Filter by user ID and completed status
        const userCompletedDonations = allDonations
          .filter((d: any) => d.userId === userId && d.status === 'COMPLETED')
          .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

        return NextResponse.json({
          success: true,
          donations: userCompletedDonations,
          warning: 'Retrieved from local fallback file (DB offline).',
        });
      } catch (fsErr) {
        console.error('[DONATION/HISTORY] Fallback reading failed:', fsErr);
        return NextResponse.json({
          error: 'Database offline and local fallback history lookup failed.',
          details: dbError?.message || String(dbError),
        }, { status: 500 });
      }
    }
  } catch (err: any) {
    console.error('[DONATION/HISTORY] Internal error:', err);
    return NextResponse.json({ error: err?.message || 'Internal Server Error' }, { status: 500 });
  }
}
