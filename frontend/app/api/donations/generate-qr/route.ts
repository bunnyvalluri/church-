import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthenticatedUser } from '@/lib/authMiddleware';
import QRCode from 'qrcode';
import { writeAuditLog } from '@/lib/auditLogger';
import { isRateLimited, rateLimitHeaders } from '@/lib/rateLimit';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';

  // Rate Limiting: Max 40 QR generations per 15 minutes per IP
  const rateLimitOpts = { windowMs: 15 * 60 * 1000, maxRequests: 40 };
  if (isRateLimited(ip, rateLimitOpts)) {
    return NextResponse.json(
      { error: 'Too many requests. Please try again later.' },
      { status: 429, headers: rateLimitHeaders(ip, rateLimitOpts) }
    );
  }

  try {
    const { sessionId } = await req.json();

    if (!sessionId) {
      return NextResponse.json({ error: 'Session ID is required.' }, { status: 400 });
    }

    // 1. Fetch the donation session
    const session = await prisma.donationSession.findUnique({
      where: { id: sessionId },
      include: { purpose: true },
    });

    if (!session) {
      return NextResponse.json({ error: 'Donation session not found.' }, { status: 404 });
    }

    // 2. Security validation: check expiration and status
    if (session.status !== 'PENDING' && session.status !== 'PROCESSING') {
      return NextResponse.json({ error: `Cannot generate QR for a session with status: ${session.status}` }, { status: 400 });
    }

    if (new Date() > session.expiresAt) {
      // Update session status to EXPIRED
      await prisma.donationSession.update({
        where: { id: sessionId },
        data: { status: 'EXPIRED' },
      });

      await writeAuditLog({
        userId: session.memberId,
        action: 'DONATION_SESSION_EXPIRED',
        details: `Donation session ${sessionId} was accessed but had already expired. Status updated.`,
        ipAddress: ip,
      });

      return NextResponse.json({ error: 'This payment session has expired. Please start a new session.' }, { status: 400 });
    }

    // 3. Optional ownership check
    const authUser = await getAuthenticatedUser(req);
    if (session.memberId && (!authUser || authUser.uid !== session.memberId)) {
      await writeAuditLog({
        userId: authUser?.uid || null,
        action: 'DONATION_QR_UNAUTHORIZED',
        details: `Unauthorized attempt to retrieve QR for session ${sessionId}`,
        ipAddress: ip,
      });
      return NextResponse.json({ error: 'Forbidden: You do not own this donation session.' }, { status: 403 });
    }

    // 4. Construct standard UPI deep link parameters
    const upiId = process.env.NEXT_PUBLIC_UPI_ID || 'kcm.kristhraj2004-1@okicici';
    const churchName = process.env.NEXT_PUBLIC_CHURCH_NAME || 'Kingdom of Christ Ministries';
    
    const encodedName = encodeURIComponent(churchName);
    const note = `KCM ${session.purpose.code} Ref ${session.referenceNumber}`;
    const encodedNote = encodeURIComponent(note);

    // upi://pay?pa=payeeAddress&pn=payeeName&am=transactionAmount&cu=currency&tn=transactionNote&tr=transactionRefId
    const upiUri = `upi://pay?pa=${upiId}&pn=${encodedName}&am=${session.amount.toFixed(2)}&cu=INR&tn=${encodedNote}&tr=${session.referenceNumber}`;

    // 5. Generate high-quality QR code image (Base64)
    const qrCodeBase64 = await QRCode.toDataURL(upiUri, {
      margin: 2,
      width: 320,
      color: {
        dark: '#4F1C91', // Church primary deep purple
        light: '#FFFFFF',
      },
    });

    await writeAuditLog({
      userId: authUser?.uid || null,
      action: 'DONATION_QR_GENERATED',
      details: `Generated UPI QR for session ${sessionId} (amount: ₹${session.amount})`,
      ipAddress: ip,
    });

    // Update status to PROCESSING on QR generation to show it is active
    if (session.status === 'PENDING') {
      await prisma.donationSession.update({
        where: { id: sessionId },
        data: { status: 'PROCESSING' },
      });

      // Notify Socket
      try {
        const companionUrl = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001';
        await fetch(`${companionUrl}/api/trigger-event`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'donation.processing',
            payload: {
              sessionId: session.id,
              referenceNumber: session.referenceNumber,
              status: 'PROCESSING',
            },
            room: 'admin:dashboard',
          }),
        });
      } catch {}
    }

    return NextResponse.json(
      {
        success: true,
        sessionId: session.id,
        referenceNumber: session.referenceNumber,
        amount: session.amount,
        upiUri,
        qrCode: qrCodeBase64,
        upiId,
        churchName,
      },
      {
        headers: rateLimitHeaders(ip, rateLimitOpts),
      }
    );
  } catch (err: any) {
    console.error('[API/DONATIONS/GENERATE-QR] Error:', err);
    return NextResponse.json(
      { error: err.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
