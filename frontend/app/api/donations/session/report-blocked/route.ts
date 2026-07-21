/**
 * POST /api/donations/session/report-blocked
 * ─────────────────────────────────────────────────────────────────────────────
 * Logs UPI provider "Blocked by Authorities" incidents (PhonePe etc.)
 * Does NOT mark the order as failed — keeps it PENDING for retry.
 *
 * This endpoint is called automatically by DynamicPaymentModal when
 * the user reports a "PhonePe Blocked" error.
 */

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { writeAuditLog } from '@/lib/auditLogger';
import { getClientIp } from '@/lib/security';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  const ip = getClientIp(req);

  let body: { sessionId?: string; blockedReason?: string; upiApp?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
  }

  const { sessionId, blockedReason = 'PHONEPE_BLOCKED_BY_AUTHORITIES', upiApp = 'PHONEPE' } = body;

  if (!sessionId) {
    return NextResponse.json({ error: 'sessionId is required.' }, { status: 400 });
  }

  try {
    const session = await prisma.donationSession.findUnique({
      where: { id: sessionId },
      select: { id: true, status: true, amount: true, referenceNumber: true },
    });

    if (!session) {
      return NextResponse.json({ error: 'Session not found.' }, { status: 404 });
    }

    // Only update if not already completed — keep order PENDING for retry
    if (session.status !== 'COMPLETED' && session.status !== 'FAILED') {
      await prisma.donationSession.update({
        where: { id: sessionId },
        data: {
          paymentState: 'PHONEPE_BLOCKED',
          blockedReason: `${upiApp}: ${blockedReason} — logged at ${new Date().toISOString()} from IP ${ip}`,
          // status remains PENDING — DO NOT mark FAILED
        },
      });
    }

    // Write audit log
    await writeAuditLog({
      action: 'PHONEPE_BLOCKED_REPORTED',
      details: `Session ${sessionId} | Amount ₹${session.amount} | OrderRef: ${session.referenceNumber} | App: ${upiApp} | Reason: ${blockedReason} | IP: ${ip}`,
      ipAddress: ip,
    });

    return NextResponse.json({
      success: true,
      message: 'Incident logged. Order remains active for retry.',
      sessionId,
    });

  } catch (err: any) {
    console.error('[REPORT_BLOCKED]', err?.message);
    return NextResponse.json({ error: 'Failed to log incident.' }, { status: 500 });
  }
}
