import { PrismaClient } from '@prisma/client';

// ── Global type extension for singleton pattern ───────────────────────────────
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  prismaDisconnectRegistered: boolean | undefined;
};

// ── Optimized Prisma Client ───────────────────────────────────────────────────
const realPrisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === 'development'
        ? ['warn', 'error'] // removed 'query' to reduce console noise
        : ['error'],
    errorFormat: 'pretty',
  });

// ── Prevent multiple instances during hot-reload in dev ──────────────────────
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = realPrisma;
}

export const prisma = new Proxy(realPrisma, {
  get(target, prop) {
    if (process.env.DB_OFFLINE === 'true') {
      if (prop === '$disconnect' || prop === '$connect') {
        return () => Promise.resolve();
      }
      throw new Error('Database offline: Bypassed via DB_OFFLINE environment variable.');
    }
    return Reflect.get(target, prop);
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
