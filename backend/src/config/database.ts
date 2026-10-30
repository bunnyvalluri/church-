/**
 * src/config/database.ts
 * Database connection pool settings and limits.
 */

import { env } from './env';

export const dbConfig = {
  url: env.DATABASE_URL,
  isOffline: env.DB_OFFLINE,
  connectionTimeoutMs: 5000,
  pool: {
    min: 2,
    max: 10,
    idleTimeoutMs: 30000,
  },
  mongo: {
    uri: env.MONGODB_URI,
    dbName: env.MONGODB_DATABASE_NAME,
    isOffline: env.MONGODB_OFFLINE,
  },
};

