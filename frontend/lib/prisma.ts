import { PrismaClient } from '../prisma/generated/client';

// ── Global type extension for singleton pattern ───────────────────────────────
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  prismaDisconnectRegistered: boolean | undefined;
};

// ── Neon Serverless Connection Recovery Helper ───────────────────────────────
function isConnectionClosedError(error: any): boolean {
  if (!error) return false;
  const msg = String(error.message || error || '');
  return (
    msg.includes('Closed') ||
    msg.includes('kind: Closed') ||
    msg.includes('P1017') ||
    msg.includes('P1001') ||
    msg.includes('P2024') ||
    msg.includes('Connection closed') ||
    msg.includes('Connection reset by peer') ||
    msg.includes('Connection terminated') ||
    error.code === 'P1017' ||
    error.code === 'P1001'
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
        console.warn(`[Prisma:Neon] Connection dropped (kind: Closed). Retrying query (attempt ${attempt}/${maxRetries}) after backoff...`);
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
    log: [
      { emit: 'event', level: 'error' },
      { emit: 'event', level: 'warn' },
    ],
    errorFormat: 'pretty',
  });

  // Intercept and handle connection events gracefully
  (client as any).$on('error', (e: any) => {
    const msg = String(e?.message || '');
    if (isConnectionClosedError(msg)) {
      if (process.env.NODE_ENV === 'development') {
        console.info('[Prisma:Neon] Idle pooled connection closed by serverless PgBouncer; reconnecting automatically on next query.');
      }
      return;
    }
    console.error('[Prisma Error]:', e?.message || e);
  });

  (client as any).$on('warn', (e: any) => {
    const msg = String(e?.message || '');
    if (isConnectionClosedError(msg)) return;
    console.warn('[Prisma Warning]:', msg || e);
  });

  return client;
}

// ── Optimized Prisma Client Singleton ─────────────────────────────────────────
const realPrisma = globalForPrisma.prisma ?? createPrismaClient();

// ── Prevent multiple instances during hot-reload in dev ──────────────────────
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = realPrisma;
}

export const prisma = new Proxy(realPrisma, {
  get(target, prop, receiver) {
    if (process.env.DB_OFFLINE === 'true') {
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

    // Wrap model delegates (e.g. prisma.user, prisma.donation, prisma.receipt) with resilient retry
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

    if (val === undefined && typeof prop === 'string' && !prop.startsWith('$')) {
      // Re-instantiate if a new model was added during dev session
      const fresh = createPrismaClient();
      globalForPrisma.prisma = fresh;
      return Reflect.get(fresh, prop);
    }

    return val;
  },
}) as unknown as PrismaClient;

// ── Graceful shutdown on process exit ────────────────────────────────────────
// Ensures Prisma closes DB connections cleanly (avoids connection pool leaks)
if (!globalForPrisma.prismaDisconnectRegistered) {
  process.on('beforeExit', async () => {
    try {
      await prisma.$disconnect();
    } catch (e) {
      // Ignore disconnect errors during exit
    }
  });
  globalForPrisma.prismaDisconnectRegistered = true;
}
