export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { getSessionFromRequest } from '@/lib/session';

export async function GET(req: Request) {
  const timestamp = new Date().toISOString();
  const start = Date.now();

  const session = await getSessionFromRequest(req).catch(() => null);
  const healthKey = req.headers.get('x-health-key');
  const authorizedSecret = process.env.SESSION_SECRET || process.env.NEXTAUTH_SECRET;

  const isAuthorized =
    Boolean(session && (session.role === 'SUPER_ADMIN' || session.role === 'PASTOR')) ||
    Boolean(healthKey && authorizedSecret && healthKey === authorizedSecret);

  try {
    // 1. Bcrypt sanity check
    const hash = await bcrypt.hash('kcm-health-check', 4);
    const bcryptOk = await bcrypt.compare('kcm-health-check', hash);

    // 2. Session secret configuration check
    const sessionConfigured = Boolean(authorizedSecret && authorizedSecret.length >= 16);

    const isHealthy = bcryptOk && sessionConfigured;

    if (!isAuthorized) {
      return NextResponse.json({
        status: isHealthy ? 'ok' : 'degraded',
        service: 'kcm-auth',
        timestamp,
      });
    }

    const recentSecEvents = await prisma.securityEvent.count({
      where: { createdAt: { gte: new Date(Date.now() - 60 * 60 * 1000) } },
    }).catch(() => 0);

    return NextResponse.json({
      status: isHealthy ? 'healthy' : 'degraded',
      latencyMs: Date.now() - start,
      timestamp,
      diagnostics: {
        bcryptOperational: bcryptOk,
        sessionSecretConfigured: sessionConfigured,
        recentSecurityEvents1h: recentSecEvents,
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        status: 'unhealthy',
        error: isAuthorized ? err.message : 'Auth probe failed',
        timestamp,
      },
      { status: 503 }
    );
  }
}
