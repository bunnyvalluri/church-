/**
 * src/api/middlewares/errorHandler.middleware.ts
 * Centralized, safe error-handling middleware preventing internal leakage.
 */

import { Request, Response, NextFunction } from 'express';
import { AppError } from '../../shared/errors';
import { sendError } from '../responses/apiResponse';
import { logger } from '../../shared/logger';
import { env } from '../../config/env';

export function errorHandler(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const requestId = req.id || req.correlationId;

  // 1. Handled Operational Errors
  if (err instanceof AppError) {
    logger.warn(`[API_ERROR] ${err.code}: ${err.message}`, {
      statusCode: err.statusCode,
      requestId,
      details: err.details,
    });
    sendError(res, err.message, err.statusCode, err.code, err.details);
    return;
  }

  // 2. Prisma Known Errors
  if (err?.code && typeof err.code === 'string' && err.code.startsWith('P')) {
    logger.error(`[PRISMA_ERROR] Code ${err.code}: ${err.message}`, { requestId });

    if (err.code === 'P2002') {
      sendError(res, 'A record with this unique identifier already exists.', 409, 'UNIQUE_CONSTRAINT_VIOLATION');
      return;
    }
    if (err.code === 'P2025') {
      sendError(res, 'Record not found in the database.', 404, 'RECORD_NOT_FOUND');
      return;
    }

    sendError(res, 'Database transaction failed.', 500, 'DATABASE_ERROR');
    return;
  }

  // 3. Unhandled Internal Server Errors
  logger.error(`[UNHANDLED_EXCEPTION] ${err?.message || err}`, {
    stack: err?.stack,
    requestId,
  });

  const message = env.IS_PROD
    ? 'An unexpected internal error occurred. Please try again later.'
    : err?.message || 'Internal Server Error';

  sendError(res, message, 500, 'INTERNAL_SERVER_ERROR', !env.IS_PROD ? err?.stack : undefined);
}

