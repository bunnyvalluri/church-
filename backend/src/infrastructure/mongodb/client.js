/**
 * backend/src/infrastructure/mongodb/client.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Backend singleton MongoDB Atlas Client.
 * Manages connection pooling, lifecycle, health probes, and graceful shutdown.
 * ─────────────────────────────────────────────────────────────────────────────
 */

const { MongoClient } = require('mongodb');
const { getMongoDBConfig } = require('./config');

let client = null;
let clientPromise = null;
let disconnectRegistered = false;

function initClient() {
  const config = getMongoDBConfig();
  if (config.isOffline || !config.uri) {
    return null;
  }

  if (!clientPromise) {
    const options = {
      minPoolSize: config.minPoolSize,
      maxPoolSize: config.maxPoolSize,
      connectTimeoutMS: config.connectTimeoutMS,
      serverSelectionTimeoutMS: config.serverSelectionTimeoutMS,
      socketTimeoutMS: config.socketTimeoutMS,
      retryWrites: true,
      w: 'majority',
    };

    client = new MongoClient(config.uri, options);
    clientPromise = client.connect().catch((err) => {
      console.warn(`[MONGODB_BACKEND] Connection warning: ${err.message}`);
      return null;
    });

    if (!disconnectRegistered) {
      const shutdown = async () => {
        try {
          if (client) {
            await client.close(false);
            console.log('[MONGODB_BACKEND] Connection pool cleanly closed.');
          }
        } catch (e) {
          // ignore error on exit
        }
      };
      process.on('SIGINT', shutdown);
      process.on('SIGTERM', shutdown);
      disconnectRegistered = true;
    }
  }

  return clientPromise;
}

async function getMongoDb() {
  const config = getMongoDBConfig();
  if (config.isOffline) return null;

  try {
    const promise = initClient();
    if (!promise) return null;
    const connectedClient = await promise;
    if (!connectedClient) return null;
    return connectedClient.db(config.dbName);
  } catch (err) {
    console.error('[MONGODB_BACKEND] getMongoDb error:', err.message);
    return null;
  }
}

async function checkMongoHealth() {
  const config = getMongoDBConfig();
  if (config.isOffline) {
    return { status: 'offline', message: 'MONGODB_OFFLINE=true or MONGODB_URI not set' };
  }

  const start = Date.now();
  try {
    const db = await getMongoDb();
    if (!db) {
      return { status: 'unhealthy', latencyMs: Date.now() - start, message: 'Database handle unavailable' };
    }
    const res = await db.command({ ping: 1 });
    const latencyMs = Date.now() - start;
    if (res && res.ok === 1) {
      return { status: 'healthy', latencyMs };
    }
    return { status: 'unhealthy', latencyMs, message: 'Ping response not ok' };
  } catch (err) {
    return { status: 'unhealthy', latencyMs: Date.now() - start, message: err.message };
  }
}

module.exports = {
  getMongoDb,
  checkMongoHealth,
  initClient,
};
