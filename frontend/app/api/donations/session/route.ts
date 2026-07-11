import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthenticatedUser } from '@/lib/authMiddleware';
import { DonationSessionSchema, sanitizeInput } from '@/lib/security';
import { writeAuditLog } from '@/lib/auditLogger';
import { isRateLimited, rateLimitHeaders } from '@/lib/rateLimit';
import QRCode from 'qrcode';
import { safeTriggerCompanionEvent } from '@/lib/socketTrigger';

export const dynamic = 'force-dynamic';

function generateReferenceNumber() {
  const timestamp = Date.now().toString(36);
  const randomStr = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `REF-${timestamp.toUpperCase()}-${randomStr}`;
}

export async function POST(req: Request) {
  const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';
  const userAgent = req.headers.get('user-agent') || 'Unknown Device';

  // Rate Limiting: Max 25 donation sessions per 15 minutes per IP
  const rateLimitOpts = { windowMs: 15 * 60 * 1000, maxRequests: 25 };
  if (isRateLimited(ip, rateLimitOpts)) {
    await writeAuditLog({
      action: 'SECURITY_RATE_LIMIT',
      details: `Rate limit hit for donation session creation by IP: ${ip}`,
      ipAddress: ip,
      userAgent,
    });
    return NextResponse.json(
      { error: 'Too many requests. Please try again later.' },
      { status: 429, headers: rateLimitHeaders(ip, rateLimitOpts) }
    );
  }

  try {
    const authUser = await getAuthenticatedUser(req);
    const body = await req.json();

    // Input Sanitization
    if (body.donorName) body.donorName = sanitizeInput(body.donorName);
    if (body.donorEmail) body.donorEmail = sanitizeInput(body.donorEmail);
    if (body.donorPhone) body.donorPhone = sanitizeInput(body.donorPhone);

    // Zod Schema Validation
    const validation = DonationSessionSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.format() },
        { status: 400 }
      );
    }

    const { amount, purposeCode, branchId } = validation.data;

    // 1 & 2. Fetch dynamic donation purpose and branch in parallel to save database roundtrips
    const [purpose, branchCheck] = await Promise.all([
      prisma.donationPurpose.findFirst({
        where: { code: purposeCode, isActive: true, isArchived: false },
      }),
      branchId
        ? prisma.branch.findUnique({ where: { id: branchId } })
        : Promise.resolve(true),
    ]);

    if (!purpose) {
      return NextResponse.json({ error: 'Selected donation purpose is invalid or inactive.' }, { status: 400 });
    }

    if (branchId && !branchCheck) {
      return NextResponse.json({ error: 'Selected branch is invalid.' }, { status: 400 });
    }

    // 3. Create a unique reference number and expiration timestamp (15 minutes from now)
    const referenceNumber = generateReferenceNumber();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 mins expiry

    // 4. Construct standard UPI deep link parameters and pre-generate QR code
    const upiId = process.env.NEXT_PUBLIC_UPI_ID || 'kcm.kristhraj2004-1@okicici';
    const churchName = process.env.NEXT_PUBLIC_CHURCH_NAME || 'Kingdom of Christ Ministries';
    
    const encodedName = encodeURIComponent(churchName);
    const note = `KCM ${purpose.code} Ref ${referenceNumber}`;
    const encodedNote = encodeURIComponent(note);

    // upi://pay?pa=payeeAddress&pn=payeeName&am=transactionAmount&cu=currency&tn=transactionNote&tr=transactionRefId
    const upiUri = `upi://pay?pa=${upiId}&pn=${encodedName}&am=${amount.toFixed(2)}&cu=INR&tn=${encodedNote}&tr=${referenceNumber}`;

    // Generate high-quality QR code image (Base64)
    const qrCodeBase64 = await QRCode.toDataURL(upiUri, {
      margin: 2,
      width: 320,
      color: {
        dark: '#4F1C91', // Church primary deep purple
        light: '#FFFFFF',
      },
    });

    // 5. Create the session in the database directly in PROCESSING status
    const session = await prisma.donationSession.create({
      data: {
        memberId: authUser?.uid || null,
        branchId: branchId || null,
        purposeId: purpose.id,
        amount,
        currency: 'INR',
        referenceNumber,
        status: 'PROCESSING',
        expiresAt,
        ipAddress: ip,
        device: userAgent.substring(0, 255),
      },
      include: {
        purpose: true,
        branch: true,
      },
    });

    // Write Audit Log (non-blocking in background)
    writeAuditLog({
      userId: authUser?.uid || null,
      action: 'DONATION_SESSION_CREATED',
      details: `Initialized donation session ${session.id} for ₹${amount} (${purpose.code}) and pre-generated dynamic UPI QR. Ref: ${referenceNumber}`,
      ipAddress: ip,
      userAgent,
    }).catch((auditErr) => {
      console.warn('[SESSION_API] Background audit log write bypassed:', auditErr);
    });

    // Dispatch socket notification about pending session creation (Non-blocking)
    safeTriggerCompanionEvent('donation.created', {
      sessionId: session.id,
      amount: session.amount,
      purpose: purpose.nameEn,
      referenceNumber,
      status: 'PROCESSING',
      createdAt: session.createdAt,
    }, 'admin:dashboard');

    return NextResponse.json(
      {
        success: true,
        session: {
          id: session.id,
          referenceNumber: session.referenceNumber,
          amount: session.amount,
          currency: session.currency,
          expiresAt: session.expiresAt,
          purpose: session.purpose.nameEn,
          upiUri,
          qrCode: qrCodeBase64,
          upiId,
          churchName,
        },
      },
      {
        headers: rateLimitHeaders(ip, rateLimitOpts),
      }
    );
  } catch (err: any) {
    console.error('[API/DONATIONS/SESSION] Error:', err);
    return NextResponse.json(
      { error: err.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
