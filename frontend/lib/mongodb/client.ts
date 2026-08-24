/**
 * frontend/lib/mongodb/client.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Singleton MongoDB Atlas Client for Next.js Server Components and API Routes.
 * Implements connection pooling, dev hot-reload caching, graceful shutdown,
 * and resilient offline/stub fallback.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { MongoClient, Db, MongoClientOptions } from "mongodb";
import { getMongoDBConfig } from "./config";

// Global type extension to preserve MongoClient across hot-reloads in development
const globalForMongo = globalThis as unknown as {
  _mongoClientPromise?: Promise<MongoClient>;
  _mongoClientInstance?: MongoClient;
  _mongoDisconnectRegistered?: boolean;
};

let client: MongoClient | null = null;
let clientPromise: Promise<MongoClient> | null = null;

const config = getMongoDBConfig();

if (!config.isOffline && config.uri) {
  const options: MongoClientOptions = {
    minPoolSize: config.minPoolSize,
    maxPoolSize: config.maxPoolSize,
    connectTimeoutMS: config.connectTimeoutMS,
    serverSelectionTimeoutMS: config.serverSelectionTimeoutMS,
    socketTimeoutMS: config.socketTimeoutMS,
    retryWrites: true,
    w: "majority",
  };

  if (process.env.NODE_ENV === "development") {
    if (!globalForMongo._mongoClientPromise) {
      client = new MongoClient(config.uri, options);
      globalForMongo._mongoClientInstance = client;
      globalForMongo._mongoClientPromise = client.connect();
    }
    client = globalForMongo._mongoClientInstance!;
    clientPromise = globalForMongo._mongoClientPromise;
  } else {
    client = new MongoClient(config.uri, options);
    clientPromise = client.connect();
  }

  // Graceful shutdown registration
  if (!globalForMongo._mongoDisconnectRegistered && typeof process !== "undefined") {
    const gracefulDisconnect = async () => {
      try {
        if (client) {
          await client.close(false);
          console.info("[MONGODB] Cleanly closed connection pool.");
        }
      } catch (err: any) {
        console.warn("[MONGODB] Disconnect warning:", err.message);
      }
    };

    process.on("beforeExit", gracefulDisconnect);
    globalForMongo._mongoDisconnectRegistered = true;
  }
}

/**
 * Returns the active MongoDB database instance, or null if running in offline mode.
 */
export async function getMongoDb(): Promise<Db | null> {
  const currentConfig = getMongoDBConfig();
  if (currentConfig.isOffline || !clientPromise) {
    return null;
  }

  try {
    const connectedClient = await clientPromise;
    return connectedClient.db(currentConfig.dbName);
  } catch (err: any) {
    console.error("[MONGODB] Database connection acquisition error:", err.message);
    return null;
  }
}

/**
 * Returns the raw MongoClient instance for transactions / admin commands.
 */
export async function getMongoClient(): Promise<MongoClient | null> {
  const currentConfig = getMongoDBConfig();
  if (currentConfig.isOffline || !clientPromise) {
    return null;
  }

  try {
    return await clientPromise;
  } catch (err: any) {
    console.error("[MONGODB] Client acquisition error:", err.message);
    return null;
  }
}

/**
 * Probes MongoDB connection health and measures latency.
 */
export async function checkMongoHealth(): Promise<{
  status: "healthy" | "unhealthy" | "offline";
  latencyMs?: number;
  message?: string;
}> {
  const currentConfig = getMongoDBConfig();
  if (currentConfig.isOffline) {
    return { status: "offline", message: "Running in offline mode (MONGODB_OFFLINE=true)" };
  }

  const start = Date.now();
  try {
    const db = await getMongoDb();
    if (!db) {
      return { status: "unhealthy", message: "Unable to acquire database handle" };
    }

    const pingResult = await db.command({ ping: 1 });
    const latencyMs = Date.now() - start;

    if (pingResult && pingResult.ok === 1) {
      return { status: "healthy", latencyMs };
    }
    return { status: "unhealthy", latencyMs, message: "Ping did not return ok=1" };
  } catch (err: any) {
    return {
      status: "unhealthy",
      latencyMs: Date.now() - start,
      message: err.message || "Connection timeout or unreachable",
    };
  }
}
