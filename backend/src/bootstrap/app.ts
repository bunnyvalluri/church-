/**
 * src/bootstrap/app.ts
 * Express Application Setup, Middleware Wiring, and Router Assembly.
 */

import express, { Express, Request, Response, NextFunction } from 'express';
import { isOriginAllowed } from '../config/cors';
import { requestLogger } from '../api/middlewares/requestLogger.middleware';
import { generalLimiter, webhookLimiter } from '../api/middlewares/rateLimiter.middleware';
import { errorHandler } from '../api/middlewares/errorHandler.middleware';
import { apiRouter } from '../api/routes';
import { handleRazorpayWebhook } from '../webhooks/razorpay.webhook';
import { handleHttpSmsWebhook } from '../webhooks/httpsms.webhook';
import { handleGoogleWebhook } from '../webhooks/google.webhook';
import { checkPrismaHealth } from '../infrastructure/prisma/client';
import { checkMongoHealth } from '../infrastructure/mongodb/mongoClient';
import { checkRedisHealth } from '../infrastructure/redis/client';
import { NotFoundError } from '../shared/errors';

export function createExpressApp(): Express {
  const app = express();

  // 1. Raw body capture for cryptographic webhook HMAC verification
  app.use(
    express.json({
      limit: '10mb',
      verify(req: Request, _res: Response, buf: Buffer) {
        (req as any).rawBody = buf;
      },
    })
  );
  app.use(express.urlencoded({ extended: true }));

  // 2. Strict CORS Configuration
  app.use((req: Request, res: Response, next: NextFunction) => {
    const origin = req.headers.origin;
    if (origin && isOriginAllowed(origin)) {
      res.header('Access-Control-Allow-Origin', origin);
      res.header('Access-Control-Allow-Credentials', 'true');
    }
    res.header(
      'Access-Control-Allow-Headers',
      'Origin, X-Requested-With, Content-Type, Accept, Authorization, X-Request-Id, X-Razorpay-Signature'
    );
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');

    if (req.method === 'OPTIONS') {
      res.sendStatus(200);
      return;
    }
    next();
  });

  // 3. Request Correlation & Structured Logging
  app.use(requestLogger);

  // 4. General Rate Limiting
  app.use(generalLimiter);

  // ── Liveness and Readiness Health Probes ───────────────────────────────────
  app.get('/health/live', (_req: Request, res: Response) => {
    const mem = process.memoryUsage();
    res.status(200).json({
      status: 'LIVE',
      uptimeSeconds: Math.floor(process.uptime()),
      timestamp: new Date().toISOString(),
      memory: {
        rssMb: Math.round(mem.rss / (1024 * 1024)),
        heapUsedMb: Math.round(mem.heapUsed / (1024 * 1024)),
      },
    });
  });

  app.get('/health/ready', async (_req: Request, res: Response) => {
    const pg = await checkPrismaHealth();
    const isReady = pg.status !== 'unhealthy';
    res.status(isReady ? 200 : 503).json({
      status: isReady ? 'READY' : 'NOT_READY',
      database: pg.status,
      latencyMs: pg.latencyMs,
      timestamp: new Date().toISOString(),
    });
  });

  app.get('/health', async (_req: Request, res: Response) => {
    const [pg, mongo, redis] = await Promise.all([
      checkPrismaHealth(),
      checkMongoHealth(),
      checkRedisHealth(),
    ]);

    const isHealthy = pg.status !== 'unhealthy';
    res.status(isHealthy ? 200 : 503).json({
      status: isHealthy ? 'healthy' : 'degraded',
      timestamp: new Date().toISOString(),
      uptimeSeconds: Math.floor(process.uptime()),
      services: {
        postgresql: pg,
        mongodb: mongo,
        redis,
      },
    });
  });

  // ── Webhooks (Dedicated endpoints with rawBody validation) ────────────────
  app.post('/api/webhooks/razorpay', webhookLimiter, handleRazorpayWebhook);
  app.post('/api/webhooks/httpsms', webhookLimiter, handleHttpSmsWebhook);
  app.post('/api/webhooks/google', webhookLimiter, handleGoogleWebhook);

  // ── Master Modular API Router ─────────────────────────────────────────────
  app.use('/api', apiRouter);

  // ── 404 Catch-All ─────────────────────────────────────────────────────────
  app.use((req: Request, _res: Response, next: NextFunction) => {
    next(new NotFoundError(`Route ${req.method} ${req.originalUrl}`));
  });

  // ── Centralized Typed Error Handler ───────────────────────────────────────
  app.use(errorHandler);

  return app;
}
