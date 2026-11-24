/**
 * backend/src/utils/db.js
 * Shared Prisma database client singleton with generated client resolution.
 * Synchronized with global.__kcmPrisma to prevent multiple connection pools.
 */

/**
 * backend/src/utils/db.js
 * Shared Prisma database client singleton with generated client resolution.
 * Synchronized with global.__kcmPrisma to prevent multiple connection pools.
 * Built-in resilience for Neon PostgreSQL serverless idle disconnects (kind: Closed).
 */

let PrismaClient;
try {
  PrismaClient = require('../../prisma/generated/client').PrismaClient;
} catch (e) {
  PrismaClient = require('@prisma/client').PrismaClient;
}

function isConnectionClosedError(error) {
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

async function executeWithRetry(fn, client, maxRetries = 2) {
  let attempt = 0;
  while (true) {
    try {
      return await fn();
    } catch (err) {
      attempt++;
      if (isConnectionClosedError(err) && attempt <= maxRetries) {
        if (process.env.NODE_ENV === 'development') {
          console.warn(`[Prisma:Neon] Connection dropped (kind: Closed). Retrying query (attempt ${attempt}/${maxRetries}) after backoff...`);
        }
        try {
          await client.$disconnect().catch(() => {});
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

function createClient() {
  const client = new PrismaClient({
    log: [
      { emit: 'event', level: 'error' },
      { emit: 'event', level: 'warn' },
    ],
    errorFormat: 'pretty',
  });

  client.$on?.('error', (e) => {
    const msg = String(e?.message || '');
    if (isConnectionClosedError(e) || isConnectionClosedError(msg)) {
      if (process.env.NODE_ENV === 'development') {
        console.info('[Prisma:Neon] Idle pooled connection closed by serverless PgBouncer; reconnecting automatically on next query.');
      }
      return;
    }
    console.error('[Prisma Error]:', e?.message || e);
  });

  client.$on?.('warn', (e) => {
    const msg = String(e?.message || '');
    if (isConnectionClosedError(e) || isConnectionClosedError(msg)) return;
    console.warn('[Prisma Warning]:', msg || e);
  });

  return client;
}

if (!global.__kcmPrisma) {
  global.__kcmPrisma = createClient();
}

const rawPrisma = global.__kcmPrisma;

const prisma = new Proxy(rawPrisma, {
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
        return function (...args) {
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
            return function (...args) {
              return executeWithRetry(() => method.apply(modelTarget, args), target);
            };
          }
          return method;
        },
      });
    }

    return val;
  },
});

module.exports = prisma;

