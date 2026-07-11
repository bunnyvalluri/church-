import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isRateLimited, rateLimitHeaders } from '@/lib/rateLimit';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';
  const rateLimitOpts = { windowMs: 15 * 60 * 1000, maxRequests: 120 };

  if (isRateLimited(ip, rateLimitOpts)) {
    return NextResponse.json(
      { error: 'Too many requests. Please try again later.' },
      { status: 429, headers: rateLimitHeaders(ip, rateLimitOpts) }
    );
  }

  try {
    const campaigns = await prisma.ngoProject.findMany({
      where: { status: 'ACTIVE' },
      select: {
        id: true,
        title: true,
        description: true,
        targetAmount: true,
        raisedAmount: true,
        status: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(
      { success: true, campaigns },
      { headers: rateLimitHeaders(ip, rateLimitOpts) }
    );
  } catch (err: any) {
    console.error('[API/NGO/CAMPAIGNS] Error:', err);
    return NextResponse.json(
      { error: err.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
