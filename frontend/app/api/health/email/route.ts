export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { emailReliabilityAgent } from '@/lib/email/agent/email-health.agent';
import { getSessionFromRequest } from '@/lib/session';

export async function GET(req: Request) {
  const timestamp = new Date().toISOString();

  // Check authorization for sensitive diagnostic details
  const session = await getSessionFromRequest(req).catch(() => null);
  const healthKeyHeader = req.headers.get('x-health-key');
  const authorizedSecret = process.env.SESSION_SECRET || process.env.NEXTAUTH_SECRET;

  const isAuthorized =
    Boolean(session && (session.role === 'SUPER_ADMIN' || session.role === 'PASTOR' || session.role === 'ADMIN')) ||
    Boolean(healthKeyHeader && authorizedSecret && healthKeyHeader === authorizedSecret);

  try {
    const assessment = await emailReliabilityAgent.assessHealth(60);

    // Minimal public health response
    if (!isAuthorized) {
      return NextResponse.json(
        {
          status: assessment.status === 'OPERATIONAL' ? 'ok' : 'degraded',
          service: 'kcm-email-delivery',
          timestamp,
        },
        { status: assessment.status === 'OUTAGE' ? 503 : 200 }
      );
    }

    // Detailed internal diagnostic response for authenticated administrators
    return NextResponse.json(
      {
        status: assessment.status,
        timestamp,
        diagnostics: assessment,
      },
      { status: assessment.status === 'OUTAGE' ? 503 : 200 }
    );
  } catch (err: any) {
    return NextResponse.json(
      {
        status: 'error',
        error: isAuthorized ? err.message : 'Health check failed',
        timestamp,
      },
      { status: 500 }
    );
  }
}
