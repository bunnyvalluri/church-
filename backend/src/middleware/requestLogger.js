/**
 * backend/src/middleware/requestLogger.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Express Request Logger Middleware for KCM Church Platform
 * Injects x-request-id correlation headers, calculates latency, logs structured
 * HTTP request/response payloads, and surfaces client context to Grafana Loki.
 * ─────────────────────────────────────────────────────────────────────────────
 */

const { logger } = require('../utils/logger');
const crypto = require('crypto');

function requestLoggerMiddleware(req, res, next) {
  const startTime = process.hrtime();
  
  // Extract or generate correlation ID
  const correlationId = req.headers['x-request-id'] || 
                        req.headers['x-correlation-id'] || 
                        crypto.randomUUID();
                        
  req.correlationId = correlationId;
  res.setHeader('x-request-id', correlationId);

  // Extract W3C Trace Context if present
  const traceparent = req.headers['traceparent'];
  let traceId, spanId;
  if (traceparent && typeof traceparent === 'string') {
    const parts = traceparent.split('-');
    if (parts.length >= 3) {
      traceId = parts[1];
      spanId = parts[2];
    }
  }

  req.reqContext = {
    correlationId,
    traceId,
    spanId,
    clientIp: req.headers['x-forwarded-for'] || req.socket?.remoteAddress || req.ip,
    userId: req.user?.uid || req.user?.id || req.headers['x-user-id'] || 'anonymous',
    userRole: req.user?.role || req.headers['x-user-role'] || 'guest',
    http: {
      method: req.method,
      url: req.originalUrl || req.url,
      path: req.path,
      user_agent: req.headers['user-agent'] || 'unknown',
    },
  };

  // Intercept response finish event
  res.on('finish', () => {
    const diff = process.hrtime(startTime);
    const responseTimeMs = Math.round((diff[0] * 1e3 + diff[1] * 1e-6) * 100) / 100;
    const statusCode = res.statusCode;

    req.reqContext.http.status_code = statusCode;
    req.reqContext.http.response_time_ms = responseTimeMs;

    const logMeta = {
      http: req.reqContext.http,
      bytes_sent: res.getHeader('content-length') ? parseInt(res.getHeader('content-length'), 10) : 0,
    };

    if (statusCode >= 500) {
      logger.error(`HTTP ${req.method} ${req.path} failed with status ${statusCode}`, logMeta, req.reqContext);
    } else if (statusCode >= 400) {
      logger.warn(`HTTP ${req.method} ${req.path} client error status ${statusCode}`, logMeta, req.reqContext);
    } else {
      logger.info(`HTTP ${req.method} ${req.path} ${statusCode} (${responseTimeMs}ms)`, logMeta, req.reqContext);
    }
  });

  next();
}

module.exports = requestLoggerMiddleware;
