/**
 * POST /api/donations/generate-qr
 * ─────────────────────────────────────────────────────────────────────────────
 * Generates a fresh, unique QR code for an existing donation session.
 *
 * Security rules:
 *  • Session must exist and not be COMPLETED/FAILED/EXPIRED
 *  • Max 3 QR regenerations per session (prevents QR spam abuse)
 *  • Rate limit: 3 requests per 5 minutes per IP
 *  • New QR always contains a fresh timestamp to prevent replay
 *  • Old QR is invalidated in DB (replaced)
 */

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import QRCode from 'qrcode';
import { getClientIp } from '@/lib/security';
import { writeAuditLog } from '@/lib/auditLogger';

export const dynamic = 'force-dynamic';

const MAX_QR_GENERATIONS = 3;

// ─── Rate Limiter ─────────────────────────────────────────────────────────────
const qrRateMap = new Map<string, { count: number; resetAt: number }>();

function isQrRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = qrRateMap.get(ip);
  if (!entry || entry.resetAt < now) {
    qrRateMap.set(ip, { count: 1, resetAt: now + 5 * 60_000 }); // 5-min window
    return false;
  }
  entry.count++;
  return entry.count > 3;
}

export async function POST(req: Request) {
  const ip = getClientIp(req);

  // Rate limit
  if (isQrRateLimited(ip)) {
    return NextResponse.json(
      { error: 'Too many QR generation requests. Please wait a few minutes before trying again.' },
      { status: 429 }
    );
  }

  let body: { sessionId?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
  }

  const { sessionId } = body;
  if (!sessionId || typeof sessionId !== 'string') {
    return NextResponse.json({ error: 'sessionId is required.' }, { status: 400 });
  }

  try {
    // ── 1. Load session ────────────────────────────────────────────────────
    const session = await prisma.donationSession.findUnique({
      where: { id: sessionId },
      include: { purpose: true, branch: true },
    });

    if (!session) {
      return NextResponse.json({ error: 'Payment session not found.' }, { status: 404 });
    }

    // ── 2. Check terminal states ───────────────────────────────────────────
    const terminalStates: string[] = ['COMPLETED', 'FAILED', 'CANCELLED'];
    if (terminalStates.includes(session.status)) {
      return NextResponse.json(
        { error: `Cannot generate a new QR for a ${session.status.toLowerCase()} session.` },
        { status: 400 }
      );
    }

    // ── 3. Check expiry ────────────────────────────────────────────────────
    if (new Date() > session.expiresAt) {
      return NextResponse.json(
        { error: 'This payment session has expired. Please start a new donation.', expired: true },
        { status: 410 }
      );
    }

    // ── 4. Enforce max QR regeneration limit ──────────────────────────────
    const currentCount = session.qrGenerationCount ?? 1;
    if (currentCount >= MAX_QR_GENERATIONS) {
      return NextResponse.json(
        {
          error: 'Maximum QR regenerations reached for this session. Please start a new donation.',
          maxReached: true,
        },
        { status: 429 }
      );
    }

    // ── 5. Load church settings ────────────────────────────────────────────
    const settings = await prisma.churchSettings.findUnique({
      where: { id: 'settings' },
      select: { upiId: true, merchantName: true },
    }).catch(() => null);

    const upiId = settings?.upiId || process.env.UPI_ID || 'kcm.kristhraj2004-1@okicici';
    const merchantName = settings?.merchantName || 'Kingdom of Christ Ministries';

    // ── 6. Generate fresh UPI URI with new timestamp ──────────────────────
    const txNote = `KCM Donation ${session.referenceNumber} T${Date.now()}`;
    const encodedName = encodeURIComponent(merchantName);
    const encodedNote = encodeURIComponent(txNote);

    const freshUpiUri =
      `upi://pay?pa=${upiId}&pn=${encodedName}` +
      `&am=${session.amount.toFixed(2)}&cu=INR` +
      `&tn=${encodedNote}&tr=${session.referenceNumber}`;

    // ── 7. Generate new QR code ────────────────────────────────────────────
    const newQrCodeBase64 = await QRCode.toDataURL(freshUpiUri, {
      margin: 2,
      width: 360,
      errorCorrectionLevel: 'H',
      color: { dark: '#4F1C91', light: '#FFFFFF' },
    });

    // ── 8. Update session with new QR + increment counter ─────────────────
    const newExpiresAt = new Date(Math.min(
      session.expiresAt.getTime(),             // don't extend beyond original expiry
      Date.now() + 10 * 60 * 1000             // but also cap at 10 mins from now
    ));

    await prisma.donationSession.update({
      where: { id: sessionId },
      data: {
        upiUri: freshUpiUri,
        qrCodeData: newQrCodeBase64,
        qrGenerationCount: currentCount + 1,
        paymentState: 'QR_GENERATED',
      },
    });

    // ── 9. Audit log ───────────────────────────────────────────────────────
    writeAuditLog({
      action: 'QR_REGENERATED',
      details: `Session ${sessionId} — QR regeneration #${currentCount + 1} from IP ${ip}`,
      ipAddress: ip,
    }).catch(() => {});

    return NextResponse.json({
      success: true,
      qrCode: newQrCodeBase64,
      upiUri: freshUpiUri,
      upiId,
      regenerationCount: currentCount + 1,
      maxRegenerations: MAX_QR_GENERATIONS,
      remainingRegenerations: MAX_QR_GENERATIONS - (currentCount + 1),
      expiresAt: session.expiresAt,
    });

  } catch (err: any) {
    console.error('[GENERATE_QR] Error:', err?.message);
    return NextResponse.json(
      { error: 'Failed to generate new QR code. Please try again.' },
      { status: 500 }
    );
  }
}
