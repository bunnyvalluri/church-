import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdminOrDev } from '@/lib/authMiddleware';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const auth = await requireAdminOrDev(req);
  if (auth instanceof NextResponse) return auth;

  try {
    const accounts = await prisma.account.findMany({
      orderBy: { name: 'asc' },
    });
    return NextResponse.json({ success: true, accounts });
  } catch (err: any) {
    console.error('[ADMIN/ACCOUNTS/GET] Error:', err);
    return NextResponse.json(
      { error: err?.message || 'Database error occurred' },
      { status: 500 }
    );
  }
}
