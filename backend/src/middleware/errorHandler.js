/**
 * backend/src/middleware/errorHandler.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Centralized Domain & System Error Handler Middleware.
 * Captures custom AppError hierarchy, Prisma error codes, and uncaught exceptions.
 * Writes audit telemetry on severe failures.
 * ─────────────────────────────────────────────────────────────────────────────
 */

const { AppError, sendError } = require('../utils/apiResponse');
const { logAuditEvent } = require('../services/auditLogger');

/**
 * Express Global Error Middleware
 */
async function errorHandler(err, req, res, next) {
  console.error(`[ERROR_HANDLER] [${req.method} ${req.url}]`, err);

  // 1. Handle Known AppError Hierarchy
  if (err instanceof AppError) {
    if (err.statusCode >= 500) {
      await logAuditEvent({
        action: 'SYSTEM_ERROR_CRITICAL',
        entity: 'EXPRESS_SERVER',
        details: { url: req.url, method: req.method, error: err.message, stack: err.stack },
        severity: 'CRITICAL',
        loopName: 'Error Handling System',
      });
    }

    return sendError(res, err.message, err.statusCode, err.errorCode, err.details);
  }

  // 2. Handle Prisma Database Specific Errors
  if (err.code && err.code.startsWith('P')) {
    let statusCode = 400;
    let message = 'Database operation failed.';
    let errorCode = 'DATABASE_ERROR';

    if (err.code === 'P2002') {
      message = 'A duplicate record already exists.';
      errorCode = 'DUPLICATE_ENTRY';
    } else if (err.code === 'P2025') {
      statusCode = 404;
      message = 'Record to update/delete was not found.';
      errorCode = 'RECORD_NOT_FOUND';
    }

    return sendError(res, message, statusCode, errorCode, { prismaCode: err.code, meta: err.meta });
  }

  // 3. Handle Syntax / JSON Parse Errors
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return sendError(res, 'Malformed JSON payload.', 400, 'MALFORMED_JSON');
  }

  // 4. Default Internal Server Error Fallback
  await logAuditEvent({
    action: 'UNHANDLED_EXCEPTION',
    entity: 'EXPRESS_SERVER',
    details: { url: req.url, method: req.method, error: err.message, stack: err.stack },
    severity: 'ERROR',
    loopName: 'Error Handling System',
  });

  return sendError(
    res,
    process.env.NODE_ENV === 'production' ? 'An unexpected error occurred.' : err.message,
    500,
    'INTERNAL_SERVER_ERROR',
    process.env.NODE_ENV === 'production' ? null : { stack: err.stack }
  );
}

module.exports = errorHandler;
