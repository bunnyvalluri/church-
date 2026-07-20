/**
 * app/api/donations/live-status/[sessionId]/route.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Real-time payment state listener powered by Server-Sent Events (SSE).
 * Streams status transitions (PENDING -> PROCESSING -> VERIFIED -> COMPLETED / FAILED)
 * directly to the client browser without polling overload.
 */

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(
  req: Request,
  { params }: { params: { sessionId: string } }
) {
  const sessionId = params.sessionId;

  if (!sessionId) {
    return NextResponse.json({ error: 'Session ID required' }, { status: 400 });
  }

  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();

      const sendEvent = (data: object) => {
        try {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
        } catch (e) {
          // Controller might be closed
        }
      };

      // Initial check
      let lastStatus = '';
      let checksRemaining = 120; // Stream up to ~2 minutes (120 x 1 sec)

      const interval = setInterval(async () => {
        try {
          checksRemaining--;
          const session = await prisma.donationSession.findUnique({
            where: { id: sessionId },
            select: {
              id: true,
              status: true,
              paymentState: true,
              expiresAt: true,
              donations: {
                select: { id: true },
                take: 1,
              },
            },
          });

          if (!session) {
            sendEvent({ error: 'Session not found', status: 'EXPIRED' });
            clearInterval(interval);
            controller.close();
            return;
          }

          const currentStatus = session.status;
          const donationId = session.donations[0]?.id || null;

          if (currentStatus !== lastStatus) {
            lastStatus = currentStatus;
            sendEvent({
              sessionId: session.id,
              status: currentStatus,
              paymentState: session.paymentState,
              donationId,
              isTerminal: ['COMPLETED', 'FAILED', 'EXPIRED', 'CANCELLED'].includes(currentStatus),
            });
          }

          // Close on terminal state or timeout
          if (
            ['COMPLETED', 'FAILED', 'EXPIRED', 'CANCELLED'].includes(currentStatus) ||
            checksRemaining <= 0 ||
            new Date() > session.expiresAt
          ) {
            clearInterval(interval);
            controller.close();
          }
        } catch (error) {
          console.error('[SSE_STATUS_ERROR]', error);
          clearInterval(interval);
          controller.close();
        }
      }, 1000);

      req.signal.addEventListener('abort', () => {
        clearInterval(interval);
      });
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
    },
  });
}
