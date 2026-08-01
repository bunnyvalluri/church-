/**
 * backend/src/utils/apiResponse.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Standardized API Response Envelopes & Utility Functions
 * Ensures consistent JSON response structure:
 * {
 *   success: boolean,
 *   data: any,
 *   error?: { code: string, message: string, details?: any },
 *   meta: { timestamp: string, correlationId: string, version: string }
 * }
 * ─────────────────────────────────────────────────────────────────────────────
 */

const { v4: uuidv4 } = require('uuid');

/**
 * Send a standardized HTTP success response.
 */
function sendSuccess(res, data, message = 'Operation successful', statusCode = 200, meta = {}) {
  const correlationId = res.req?.headers?.['x-correlation-id'] || uuidv4();
  
  return res.status(statusCode).json({
    success: true,
    message,
    data,
    meta: {
      timestamp: new Date().toISOString(),
      correlationId,
      version: '1.0.0',
      ...meta,
    },
  });
}

/**
 * Send a standardized HTTP error response.
 */
function sendError(res, message = 'Internal Server Error', statusCode = 500, errorCode = 'INTERNAL_ERROR', details = null) {
  const correlationId = res.req?.headers?.['x-correlation-id'] || uuidv4();

  return res.status(statusCode).json({
    success: false,
    error: {
      code: errorCode,
      message,
      ...(details ? { details } : {}),
    },
    meta: {
      timestamp: new Date().toISOString(),
      correlationId,
      version: '1.0.0',
    },
  });
}

/**
 * Domain-specific Error Classes for structured error handling.
 */
class AppError extends Error {
  constructor(message, statusCode = 500, errorCode = 'INTERNAL_ERROR', details = null) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.details = details;
    Error.captureStackTrace(this, this.constructor);
  }
}

class ValidationError extends AppError {
  constructor(message, details = null) {
    super(message, 400, 'VALIDATION_ERROR', details);
  }
}

class AuthError extends AppError {
  constructor(message = 'Unauthorized access', statusCode = 401) {
    super(message, statusCode, 'AUTHENTICATION_ERROR');
  }
}

class ForbiddenError extends AppError {
  constructor(message = 'Access forbidden') {
    super(message, 403, 'AUTHORIZATION_ERROR');
  }
}

class UploadError extends AppError {
  constructor(message, details = null) {
    super(message, 422, 'UPLOAD_VERIFICATION_FAILED', details);
  }
}

class NotFoundError extends AppError {
  constructor(message = 'Resource not found') {
    super(message, 404, 'NOT_FOUND_ERROR');
  }
}

module.exports = {
  sendSuccess,
  sendError,
  AppError,
  ValidationError,
  AuthError,
  ForbiddenError,
  UploadError,
  NotFoundError,
};
