/**
 * src/infrastructure/mongodb/mongoClient.ts
 * MongoDB Atlas client singleton and health probe.
 */

import { MongoClient } from 'mongodb';
import { dbConfig } from '../../config/database';
import { logger } from '../../shared/logger';

let client: MongoClient | null = null;
let clientPromise: Promise<MongoClient | null> | null = null;

export function getMongoDbClient(): Promise<MongoClient | null> {
  if (dbConfig.mongo.isOffline || !dbConfig.mongo.uri) {
    return Promise.resolve(null);
  }

  if (!clientPromise) {
    try {
      client = new MongoClient(dbConfig.mongo.uri, {
        minPoolSize: 1,
        maxPoolSize: 10,
        connectTimeoutMS: 5000,
        serverSelectionTimeoutMS: 5000,
      });

      clientPromise = client.connect().catch((err) => {
        logger.warn(`[MONGODB] Connection warning: ${err.message}`);
        return null;
      });
    } catch (err: any) {
      logger.warn(`[MONGODB] Init error: ${err.message}`);
      return Promise.resolve(null);
    }
  }

  return clientPromise;
}

export async function getMongoDb(): Promise<any> {
  const c = await getMongoDbClient();
  if (!c) return null;
  return c.db(dbConfig.mongo.dbName);
}

export async function checkMongoHealth(): Promise<{ status: string; latencyMs: number; database?: string }> {
  if (dbConfig.mongo.isOffline || !dbConfig.mongo.uri) {
    return { status: 'offline', latencyMs: 0, database: dbConfig.mongo.dbName };
  }
  const start = Date.now();
  try {
    const db = await getMongoDb();
    if (!db) {
      return { status: 'offline', latencyMs: 0 };
    }
    await db.command({ ping: 1 });
    return { status: 'healthy', latencyMs: Date.now() - start, database: dbConfig.mongo.dbName };
  } catch (err: any) {
    return { status: 'unhealthy', latencyMs: Date.now() - start };
  }
}

export async function closeMongoClient(): Promise<void> {
  if (client) {
    try {
      await client.close(false);
      logger.info('[MONGODB] Connection pool closed cleanly.');
    } catch {}
    client = null;
    clientPromise = null;
  }
}

