import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthenticatedUser } from '@/lib/authMiddleware';
import { isRateLimited, rateLimitHeaders } from '@/lib/rateLimit';
import { getClientIp } from '@/lib/apiResponse';
import { logEvent, LogLevel } from '@/lib/logger';

export const dynamic = 'force-dynamic';

// Helper to generate a unique donation session ID
function generateDonationId() {
  const timestamp = Date.now().toString(36);
  const randomStr = Math.random().toString(36).substring(2, 7);
  return `don_${timestamp}${randomStr}`;
}

export async function POST(req: Request) {
  const ip = getClientIp(req);

  // 1. Rate Limiting: Max 20 session initializations per 15 minutes per IP
  const rateLimitOpts = { windowMs: 15 * 60 * 1000, maxRequests: 20 };
  if (isRateLimited(ip, rateLimitOpts)) {
    logEvent(LogLevel.SECURITY, 'DONATION_SESSION_INIT_LIMIT', `Rate limit hit by IP: ${ip}`);
    return NextResponse.json(
      { error: 'Too many requests. Please try again later.' },
      { status: 429, headers: rateLimitHeaders(ip, rateLimitOpts) }
    );
  }

  try {
    // 2. JWT Authentication (Optional check for logged-in member context)
    const user = await getAuthenticatedUser(req);
    const userId = user?.uid || null;

    const donationId = generateDonationId();

    // 3. Create a pending donation session in the database
    const donation = await prisma.donation.create({
      data: {
        id: donationId,
        userId: userId,
        amount: 0.0, // Initial placeholder, updated when user inputs amount
        purpose: 'TITHE', // Default purpose
        paymentMethod: 'UPI',
        currency: 'INR',
        status: 'PENDING',
        donorName: user?.name || null,
        donorEmail: user?.email || null,
      },
    });

    logEvent(
      LogLevel.INFO,
      'DONATION_SESSION_INIT',
      `Donation session ${donationId} initialized successfully for IP: ${ip}, User: ${userId || 'GUEST'}`
    );

    return NextResponse.json(
      {
        success: true,
        donationId: donation.id,
        status: donation.status,
      },
      {
        status: 201,
        headers: rateLimitHeaders(ip, rateLimitOpts),
      }
    );
  } catch (err: any) {
    logEvent(
      LogLevel.ERROR,
      'DONATION_SESSION_INIT_FAIL',
      `Failed to initialize donation session for IP: ${ip}. Error: ${err.message}`,
      { stack: err.stack }
    );

    return NextResponse.json(
      { error: 'Internal Server Error occurred while initializing donation.' },
      { status: 500 }
    );
  }
}
