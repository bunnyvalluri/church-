import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthenticatedUser } from '@/lib/authMiddleware';
import { isRateLimited, rateLimitHeaders } from '@/lib/rateLimit';
import { getClientIp, safeJson } from '@/lib/apiResponse';
import { logEvent, LogLevel } from '@/lib/logger';
import QRCode from 'qrcode';

export const dynamic = 'force-dynamic';

const VALID_PURPOSES = ['GENERAL', 'BUILDING', 'MISSIONS', 'YOUTH', 'CHARITY', 'TITHE', 'OFFERING', 'OTHER'];

export async function POST(req: Request) {
  const ip = getClientIp(req);

  // 1. Rate Limiting: Max 40 updates per 15 minutes per IP
  const rateLimitOpts = { windowMs: 15 * 60 * 1000, maxRequests: 40 };
  if (isRateLimited(ip, rateLimitOpts)) {
    logEvent(LogLevel.SECURITY, 'DONATION_SESSION_UPDATE_LIMIT', `Rate limit hit by IP: ${ip}`);
    return NextResponse.json(
      { error: 'Too many requests. Please try again later.' },
      { status: 429, headers: rateLimitHeaders(ip, rateLimitOpts) }
    );
  }

  // 2. Safely parse JSON body
  const body = await safeJson<any>(req);
  if (!body) {
    return NextResponse.json({ error: 'Invalid JSON request body.' }, { status: 400 });
  }

  const { donationId, amount, purpose, donorName, donorEmail, donorPhone } = body;

  // 3. Validation
  if (!donationId) {
    return NextResponse.json({ error: 'Donation session ID is required.' }, { status: 400 });
  }

  if (amount === undefined || isNaN(Number(amount)) || Number(amount) <= 0) {
    return NextResponse.json({ error: 'A valid donation amount greater than 0 is required.' }, { status: 400 });
  }

  if (!purpose || !VALID_PURPOSES.includes(purpose)) {
    return NextResponse.json({ error: 'A valid donation purpose is required.' }, { status: 400 });
  }

  if (!donorName || !donorName.trim()) {
    return NextResponse.json({ error: 'Donor name is required.' }, { status: 400 });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!donorEmail || !emailRegex.test(donorEmail)) {
    return NextResponse.json({ error: 'A valid email address is required.' }, { status: 400 });
  }

  const phoneRegex = /^\+?[0-9]{10,15}$/;
  const cleanedPhone = donorPhone ? donorPhone.replace(/[\s-]/g, "") : "";
  if (!donorPhone || !phoneRegex.test(cleanedPhone)) {
    return NextResponse.json({ error: 'A valid 10-15 digit phone number is required.' }, { status: 400 });
  }

  try {
    // 4. Fetch the existing session
    const existingDonation = await prisma.donation.findUnique({
      where: { id: donationId },
    });

    if (!existingDonation) {
      return NextResponse.json({ error: 'Donation session not found.' }, { status: 404 });
    }

    if (existingDonation.status !== 'PENDING') {
      return NextResponse.json({ error: 'Only pending donation sessions can be updated.' }, { status: 400 });
    }

    // 5. Authentication check (optional but checks ownership if session is bound to a user)
    const user = await getAuthenticatedUser(req);
    if (existingDonation.userId && (!user || user.uid !== existingDonation.userId)) {
      logEvent(LogLevel.SECURITY, 'DONATION_SESSION_UPDATE_UNAUTHORIZED', `Unauthorized session access attempt for ${donationId} by user ${user?.uid || 'GUEST'}`);
      return NextResponse.json(
        { error: 'Forbidden: You do not have permission to update this donation session.' },
        { status: 403 }
      );
    }

    const updatedAmount = parseFloat(amount);

    // 6. Update PostgreSQL record
    const updatedDonation = await prisma.donation.update({
      where: { id: donationId },
      data: {
        amount: updatedAmount,
        purpose,
        donorName: donorName.trim(),
        donorEmail: donorEmail.trim(),
        donorPhone: cleanedPhone,
        userId: user?.uid || existingDonation.userId, // bind user to session if they logged in during checkout
      },
    });

    // 7. Construct dynamic UPI URI
    const upiId = process.env.NEXT_PUBLIC_UPI_ID || 'kcm.kristhraj2004-1@okicici';
    const churchName = process.env.NEXT_PUBLIC_CHURCH_NAME || 'Kingdom of Christ Ministries';
    
    // URL encode values for UPI deep link standard
    const encodedName = encodeURIComponent(churchName);
    const note = `Donation for ${purpose} Ref ${donationId}`;
    const encodedNote = encodeURIComponent(note);

    const upiUri = `upi://pay?pa=${upiId}&pn=${encodedName}&am=${updatedAmount.toFixed(2)}&cu=INR&tn=${encodedNote}&tr=${donationId}`;

    // 8. Generate QR Code image (base64) from UPI URI
    const qrCodeBase64 = await QRCode.toDataURL(upiUri, {
      margin: 2,
      width: 300,
      color: {
        dark: '#4F1C91', // Church primary purple accent
        light: '#FFFFFF'
      }
    });

    logEvent(
      LogLevel.INFO,
      'DONATION_SESSION_UPDATE',
      `Donation session ${donationId} updated to ₹${updatedAmount} for ${purpose} by IP: ${ip}`
    );

    return NextResponse.json(
      {
        success: true,
        donationId: updatedDonation.id,
        amount: updatedDonation.amount,
        purpose: updatedDonation.purpose,
        upiUri,
        qrCode: qrCodeBase64,
        upiId,
        churchName,
      },
      {
        status: 200,
        headers: rateLimitHeaders(ip, rateLimitOpts),
      }
    );
  } catch (err: any) {
    logEvent(
      LogLevel.ERROR,
      'DONATION_SESSION_UPDATE_FAIL',
      `Failed to update donation session ${donationId} for IP: ${ip}. Error: ${err.message}`,
      { stack: err.stack }
    );

    return NextResponse.json(
      { error: 'Internal Server Error occurred while updating donation session.' },
      { status: 500 }
    );
  }
}
