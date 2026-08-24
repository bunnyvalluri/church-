/**
 * backend/src/infrastructure/mongodb/config.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Backend companion server MongoDB configuration.
 * ─────────────────────────────────────────────────────────────────────────────
 */

function getMongoDBConfig() {
  const uri = process.env.MONGODB_URI || '';
  const dbName = process.env.MONGODB_DATABASE_NAME || 'kcm_church';
  const isOffline = process.env.MONGODB_OFFLINE === 'true' || !uri;

  return {
    uri,
    dbName,
    isOffline,
    minPoolSize: parseInt(process.env.MONGODB_MIN_POOL_SIZE || '5', 10),
    maxPoolSize: parseInt(
      process.env.MONGODB_MAX_POOL_SIZE ||
        (process.env.NODE_ENV === 'production' ? '50' : '10'),
      10
    ),
    connectTimeoutMS: 10000,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
  };
}

module.exports = {
  getMongoDBConfig,
};
