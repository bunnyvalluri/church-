import { PrismaClient } from './generated/client';

/**
 * Enterprise Dual Prisma Client Configuration for CloudNativePG
 * Separates Read-Write primary pooler traffic from Read-Only replica pooler traffic.
 */

const primaryDatabaseUrl = process.env.DATABASE_URL || "";
const readReplicaDatabaseUrl = process.env.RO_DATABASE_URL || process.env.DATABASE_URL || "";

// Primary Prisma Client for Mutations, Transactions, and Writes
export const prismaPrimary = new PrismaClient({
  datasources: {
    db: {
      url: primaryDatabaseUrl,
    },
  },
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

// Read Replica Prisma Client for High-Volume Querying & Dashboards
export const prismaReadReplica = new PrismaClient({
  datasources: {
    db: {
      url: readReplicaDatabaseUrl,
    },
  },
  log: ['error'],
});

/**
 * Helper utility to run read-only queries with automatic fallback to primary if replica lags
 */
export async function withReadReplica<T>(queryFn: (client: PrismaClient) => Promise<T>): Promise<T> {
  try {
    return await queryFn(prismaReadReplica);
  } catch (error) {
    console.warn('[Prisma CNPG] Read replica query failed, falling back to Primary RW pooler:', error);
    return await queryFn(prismaPrimary);
  }
}
