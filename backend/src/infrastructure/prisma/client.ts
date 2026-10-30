/**
 * src/infrastructure/prisma/client.ts
 * Production Prisma Client singleton for PostgreSQL (Neon) with connection management.
 */

// @ts-ignore
import { PrismaClient } from '../../../prisma/generated/client';
import { env } from '../../config/env';
import { logger } from '../../shared/logger';

declare global {
  var __kcmPrisma: PrismaClient | undefined;
}

let prisma: PrismaClient;

if (!global.__kcmPrisma) {
  global.__kcmPrisma = new PrismaClient({
    datasources: {
      db: {
        url: env.DATABASE_URL,
      },
    },
    log:
      env.NODE_ENV === 'development'
        ? [
            { emit: 'event', level: 'query' },
            { emit: 'stdout', level: 'error' },
            { emit: 'stdout', level: 'warn' },
          ]
        : [{ emit: 'stdout', level: 'error' }],
  });

  if (env.NODE_ENV === 'development') {
    (global.__kcmPrisma as any).$on?.('query', (e: any) => {
      if (e.duration > 200) {
        logger.warn(`[SLOW_QUERY] ${e.duration}ms: ${e.query}`);
      }
    });
  }
}

prisma = global.__kcmPrisma;

export async function checkPrismaHealth(): Promise<{ status: 'healthy' | 'offline' | 'unhealthy'; latencyMs: number }> {
  if (env.DB_OFFLINE) {
    return { status: 'offline', latencyMs: 0 };
  }
  const start = Date.now();
  try {
    await prisma.$queryRaw`SELECT 1`;
    return { status: 'healthy', latencyMs: Date.now() - start };
  } catch (err: any) {
    logger.error('Prisma connection probe failed', { error: err.message });
    return { status: 'unhealthy', latencyMs: Date.now() - start };
  }
}

export async function disconnectPrisma(): Promise<void> {
  if (prisma) {
    await prisma.$disconnect();
    logger.info('Prisma client disconnected gracefully.');
  }
}

export { prisma };
export default prisma;
