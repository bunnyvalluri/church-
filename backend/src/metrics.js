/**
 * backend/src/metrics.js
 * Prometheus Metrics Instrumentation for Express Backend
 */

const client = require('prom-client');

// Collect default Node.js runtime metrics (event loop lag, memory heap, GC)
client.collectDefaultMetrics({
  prefix: 'nodejs_',
  timeout: 5000,
});

// Custom Metrics Definition
const httpRequestDuration = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status'],
  buckets: [0.01, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10],
});

const httpRequestsTotal = new client.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status'],
});

const expressActiveConnections = new client.Gauge({
  name: 'express_active_connections',
  help: 'Number of currently active HTTP connections',
});

const prismaQueryDuration = new client.Histogram({
  name: 'prisma_query_duration_seconds',
  help: 'Prisma DB query duration in seconds',
  labelNames: ['model', 'action'],
  buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5],
});

const cloudinaryUploadDuration = new client.Histogram({
  name: 'cloudinary_upload_duration_seconds',
  help: 'Cloudinary API media upload duration in seconds',
  labelNames: ['resource_type', 'status'],
  buckets: [0.1, 0.5, 1, 2, 5, 10, 20],
});

const firebaseAuthDuration = new client.Histogram({
  name: 'firebase_auth_duration_seconds',
  help: 'Firebase Auth token verification duration in seconds',
  labelNames: ['status'],
  buckets: [0.01, 0.05, 0.1, 0.25, 0.5, 1],
});

// Middleware to measure request duration
function metricsMiddleware(req, res, next) {
  expressActiveConnections.inc();
  const start = process.hrtime();

  res.on('finish', () => {
    expressActiveConnections.dec();
    const diff = process.hrtime(start);
    const durationInSeconds = diff[0] + diff[1] / 1e9;
    const route = req.route ? req.route.path : req.path || 'unknown';

    httpRequestDuration.observe({ method: req.method, route, status: res.statusCode }, durationInSeconds);
    httpRequestsTotal.inc({ method: req.method, route, status: res.statusCode });
  });

  next();
}

module.exports = {
  client,
  register: client.register,
  metricsMiddleware,
  httpRequestDuration,
  httpRequestsTotal,
  expressActiveConnections,
  prismaQueryDuration,
  cloudinaryUploadDuration,
  firebaseAuthDuration,
};
