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

// ── Neon Serverless Connection Recovery Helper ───────────────────────────────
function isConnectionClosedError(error: any): boolean {
  if (!error) return false;
  const msg = String(error?.message || error || '');
  const cause = String(error?.cause?.message || error?.cause || '');
  const stack = String(error?.stack || '');
  const code = String(error?.code || '');
  const combined = `${msg} ${cause} ${stack} ${code}`.toLowerCase();

  return (
    combined.includes('closed') ||
    combined.includes('kind: closed') ||
    combined.includes('p1017') ||
    combined.includes('p1001') ||
    combined.includes('p2024') ||
    combined.includes('connection closed') ||
    combined.includes('connection reset') ||
    combined.includes('connection terminated') ||
    combined.includes('server has closed the connection') ||
    combined.includes("can't reach database server") ||
    code === 'P1017' ||
    code === 'P1001'
  );
}

async function executeWithRetry<T>(fn: () => Promise<T>, client: PrismaClient, maxRetries = 2): Promise<T> {
  let attempt = 0;
  while (true) {
    try {
      return await fn();
    } catch (err: any) {
      attempt++;
      if (isConnectionClosedError(err) && attempt <= maxRetries) {
        if (env.NODE_ENV === 'development') {
          logger.warn(`[Prisma:Neon] Connection dropped (kind: Closed). Retrying query (attempt ${attempt}/${maxRetries}) after backoff...`);
        }
        try {
          await client.$disconnect().catch(() => {});
          // Delay briefly to allow Neon compute to finish waking up from sleep
          await new Promise((resolve) => setTimeout(resolve, 600 * attempt));
          await client.$connect().catch(() => {});
        } catch (connErr) {
          // Retry loop will attempt query again
        }
        continue;
      }
      throw err;
    }
  }
}

function createPrismaClient(): PrismaClient {
  const client = new PrismaClient({
    datasources: {
      db: {
        url: env.DATABASE_URL,
      },
    },
    log: [
      { emit: 'event', level: 'error' },
      { emit: 'event', level: 'warn' },
      ...(env.NODE_ENV === 'development' ? [{ emit: 'event' as const, level: 'query' as const }] : []),
    ],
    errorFormat: 'pretty',
  });

  if (env.NODE_ENV === 'development') {
    (client as any).$on?.('query', (e: any) => {
      if (e.duration > 200) {
        logger.warn(`[SLOW_QUERY] ${e.duration}ms: ${e.query}`);
      }
    });
  }

  // Intercept and handle connection events gracefully without stderr dump
  (client as any).$on?.('error', (e: any) => {
    const msg = String(e?.message || '');
    if (isConnectionClosedError(e) || isConnectionClosedError(msg)) {
      if (env.NODE_ENV === 'development') {
        logger.info('[Prisma:Neon] Idle connection closed by serverless PgBouncer; reconnecting automatically on next query.');
      }
      return;
    }
    logger.error('[Prisma Error]:', e?.message || e);
  });

  (client as any).$on?.('warn', (e: any) => {
    const msg = String(e?.message || '');
    if (isConnectionClosedError(e) || isConnectionClosedError(msg)) return;
    logger.warn('[Prisma Warning]:', msg || e);
  });

  return client;
}

if (!global.__kcmPrisma) {
  global.__kcmPrisma = createPrismaClient();
}

const rawPrisma = global.__kcmPrisma;

// Resilient Proxy wrapping model operations with auto-reconnect retry
const prisma = new Proxy(rawPrisma, {
  get(target, prop, receiver) {
    if (env.DB_OFFLINE) {
      if (prop === '$disconnect' || prop === '$connect') {
        return () => Promise.resolve();
      }
      throw new Error('Database offline: Bypassed via DB_OFFLINE environment variable.');
    }

    const val = Reflect.get(target, prop, receiver);

    // Wrap raw database calls ($queryRaw, $executeRaw) with resilient retry
    if (typeof val === 'function' && typeof prop === 'string' && prop.startsWith('$')) {
      if (prop === '$queryRaw' || prop === '$executeRaw') {
        return function (...args: any[]) {
          return executeWithRetry(() => val.apply(target, args), target);
        };
      }
      return val.bind(target);
    }

    // Wrap model delegates (e.g. prisma.user, prisma.donation) with resilient retry
    if (val && typeof val === 'object' && typeof prop === 'string' && !prop.startsWith('$')) {
      return new Proxy(val, {
        get(modelTarget, modelProp, modelReceiver) {
          const method = Reflect.get(modelTarget, modelProp, modelReceiver);
          if (typeof method === 'function') {
            return function (...args: any[]) {
              return executeWithRetry(() => method.apply(modelTarget, args), target);
            };
          }
          return method;
        },
      });
    }

    return val;
  },
}) as unknown as PrismaClient;

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
