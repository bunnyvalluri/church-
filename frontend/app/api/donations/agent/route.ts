/**
 * POST /api/donations/agent
 * GET /api/donations/agent?sessionId=...
 * ─────────────────────────────────────────────────────────────────────────────
 * AI Donation Management Agent API Endpoint.
 *
 * Responsibilities:
 *  • POST: Track user action & execute state transition
 *  • GET: Poll payment status & receipt state (backed by DB source of truth)
 */

import { NextResponse } from 'next/server';
import { getClientIp, assertJsonContentType, maskSensitive } from '@/lib/security';
import {
  checkPaymentStatus,
  cancelDonationSession,
  getDonationCompletionData,
} from '@/lib/donationAgent';
import { trackDonationEvent, type FunnelEvent } from '@/lib/donationAnalytics';
import { processDueJobs, getQueueStats } from '@/lib/donationRetryQueue';
import { runPaymentSecurityChecks } from '@/lib/paymentSecurity';

export const dynamic = 'force-dynamic';

// ─── GET: Poll Agent State & Session Payment Status ───────────────────────────

export async function GET(req: Request) {
  const ip = getClientIp(req);
  const { searchParams } = new URL(req.url);
  const sessionId = searchParams.get('sessionId');
  const donationId = searchParams.get('donationId');
  const action = searchParams.get('action');

  // Action: Flush retry queue (Admin or Cron trigger)
  if (action === 'flush_queue') {
    const result = await processDueJobs(20);
    const stats = await getQueueStats();
    return NextResponse.json({ success: true, processed: result.processed, failed: result.failed, stats });
  }

  // Action: Fetch completion data for success screen
  if (donationId) {
    const data = await getDonationCompletionData(donationId);
    if (!data) {
      return NextResponse.json({ error: 'Donation record not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data });
  }

  if (!sessionId) {
    return NextResponse.json({ error: 'sessionId query parameter required' }, { status: 400 });
  }

  // Security & Rate limiting check
  const secCheck = runPaymentSecurityChecks(ip, 'VERIFY_PAYMENT');
  if (!secCheck.allowed) {
    return NextResponse.json({ error: secCheck.reason }, { status: 429 });
  }

  try {
    const status = await checkPaymentStatus(sessionId);
    return NextResponse.json({ success: true, ...status });
  } catch (err: any) {
    console.error('[DONATION_AGENT_API] Poll error:', err?.message || err);
    return NextResponse.json({ error: 'Failed to query agent session state' }, { status: 500 });
  }
}

// ─── POST: Record Event & Execute Action ─────────────────────────────────────

export async function POST(req: Request) {
  const ip = getClientIp(req);

  const ctError = assertJsonContentType(req);
  if (ctError) {
    return NextResponse.json({ error: ctError.error }, { status: ctError.status });
  }

  try {
    let body: any;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: 'Invalid JSON payload' }, { status: 400 });
    }

    const { action, event, sessionId, donationId, memberId, amount, purposeCode, branchId, reason, metadata } = body;

    // 1. Cancel/Abandon action
    if (action === 'cancel' && sessionId) {
      await cancelDonationSession(sessionId, reason || 'User cancelled', ip);
      return NextResponse.json({ success: true, message: 'Session cancelled' });
    }

    // 2. Track analytics event
    if (event) {
      await trackDonationEvent(event as FunnelEvent, {
        sessionId,
        donationId,
        memberId,
        amount: amount ? Number(amount) : undefined,
        purposeCode,
        branchId,
        metadata,
        ip,
        userAgent: req.headers.get('user-agent') || undefined,
      });

      return NextResponse.json({ success: true, loggedEvent: event });
    }

    return NextResponse.json({ error: 'Invalid action or event specified' }, { status: 400 });
  } catch (err: any) {
    console.error('[DONATION_AGENT_API] POST Error:', err?.message || err);
    return NextResponse.json({ error: 'Agent execution failed' }, { status: 500 });
  }
}
