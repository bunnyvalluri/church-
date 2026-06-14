import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdminOrDev } from '@/lib/authMiddleware';

// Force dynamic server rendering
export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  // ── Auth Guard ─────────────────────────────────────────────────────────────
  const auth = await requireAdminOrDev(req);
  if (auth instanceof NextResponse) return auth;

  try {
    const donations = await prisma.donation.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({ success: true, donations });
  } catch (err: any) {
    console.error('[ADMIN/DONATIONS/GET] Error:', err);
    return NextResponse.json(
      { error: err?.message || 'Database error occurred' },
      { status: 500 }
    );
  }
}

