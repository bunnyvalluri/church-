export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
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
    const probePromise = prisma.$queryRaw`SELECT 1 as alive`;
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Neon database probe timed out (3000ms)')), 3000)
    );

    await Promise.race([probePromise, timeoutPromise]);
    const latencyMs = Date.now() - start;

    if (!isAuthorized) {
      return NextResponse.json({
        status: 'ok',
        service: 'neon-postgresql',
        timestamp,
      });
    }

    // Detailed metrics for authorized admin
    const [userCount, emailEventCount] = await Promise.all([
      prisma.user.count().catch(() => -1),
      prisma.emailEvent.count().catch(() => -1),
    ]);

    return NextResponse.json({
      status: 'healthy',
      latencyMs,
      timestamp,
      diagnostics: {
        pool: 'neon-serverless',
        userRecords: userCount,
        emailEventRecords: emailEventCount,
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        status: 'unhealthy',
        error: isAuthorized ? err.message : 'Database probe failed',
        timestamp,
      },
      { status: 503 }
    );
  }
}
