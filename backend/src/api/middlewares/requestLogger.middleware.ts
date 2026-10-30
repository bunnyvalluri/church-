/**
 * src/api/middlewares/requestLogger.middleware.ts
 * Structured HTTP request logging with unique correlation ID injection.
 */

import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import { logger } from '../../shared/logger';

export function requestLogger(req: Request, res: Response, next: NextFunction): void {
  const requestId = (req.headers['x-request-id'] as string) || crypto.randomUUID();
  req.id = requestId;
  req.correlationId = requestId;
  res.setHeader('X-Request-Id', requestId);

  const start = Date.now();
  const { method, originalUrl, ip } = req;

  res.on('finish', () => {
    const duration = Date.now() - start;
    const { statusCode } = res;

    const logPayload = {
      requestId,
      method,
      path: originalUrl,
      statusCode,
      durationMs: duration,
      ip,
    };

    if (statusCode >= 500) {
      logger.error(`[HTTP] ${method} ${originalUrl} -> ${statusCode} (${duration}ms)`, logPayload);
    } else if (statusCode >= 400) {
      logger.warn(`[HTTP] ${method} ${originalUrl} -> ${statusCode} (${duration}ms)`, logPayload);
    } else {
      logger.info(`[HTTP] ${method} ${originalUrl} -> ${statusCode} (${duration}ms)`, logPayload);
    }
  });

  next();
}

