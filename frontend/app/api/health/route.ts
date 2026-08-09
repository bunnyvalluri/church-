import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  const startTime = Date.now();
  let dbStatus = 'healthy';
  let dbLatencyMs = 0;

  try {
    const dbStart = Date.now();
    await prisma.$queryRaw`SELECT 1`;
    dbLatencyMs = Date.now() - dbStart;
  } catch (error: any) {
    dbStatus = 'degraded';
    console.error('[HEALTH_CHECK] DB Ping failed:', error.message);
  }

  const memoryUsage = process.memoryUsage();

  const healthData = {
    status: dbStatus === 'healthy' ? 'UP' : 'DEGRADED',
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime()),
    latencyMs: Date.now() - startTime,
    checks: {
      database: {
        status: dbStatus,
        latencyMs: dbLatencyMs,
      },
      memory: {
        rssBytes: memoryUsage.rss,
        heapTotalBytes: memoryUsage.heapTotal,
        heapUsedBytes: memoryUsage.heapUsed,
      },
      environment: process.env.NODE_ENV || 'development',
    },
  };

  const statusCode = dbStatus === 'healthy' ? 200 : 503;
  return NextResponse.json(healthData, { status: statusCode });
}
