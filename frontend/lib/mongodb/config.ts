/**
 * frontend/lib/mongodb/config.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Server-side MongoDB Atlas configuration & runtime environment validation.
 * ⚠️ NEVER expose these variables through NEXT_PUBLIC_*!
 * ─────────────────────────────────────────────────────────────────────────────
 */

export interface MongoDBConfig {
  uri: string;
  dbName: string;
  isOffline: boolean;
  minPoolSize: number;
  maxPoolSize: number;
  connectTimeoutMS: number;
  serverSelectionTimeoutMS: number;
  socketTimeoutMS: number;
}

export function getMongoDBConfig(): MongoDBConfig {
  const uri = process.env.MONGODB_URI || "";
  const dbName = process.env.MONGODB_DATABASE_NAME || "kcm_church";
  const isOffline = process.env.MONGODB_OFFLINE === "true" || !uri;

  return {
    uri,
    dbName,
    isOffline,
    minPoolSize: parseInt(process.env.MONGODB_MIN_POOL_SIZE || "5", 10),
    maxPoolSize: parseInt(
      process.env.MONGODB_MAX_POOL_SIZE ||
        (process.env.NODE_ENV === "production" ? "50" : "10"),
      10
    ),
    connectTimeoutMS: 10000,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
  };
}
