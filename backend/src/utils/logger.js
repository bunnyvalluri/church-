/**
 * backend/src/utils/logger.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Enterprise Structured JSON Logger for KCM Church Platform (Node.js/Express)
 * Supports correlation IDs, trace propagation, security audit logging,
 * and database query observability for Grafana Loki ingestion via Alloy.
 * ─────────────────────────────────────────────────────────────────────────────
 */

const LOG_LEVELS = {
  TRACE: 10,
  DEBUG: 20,
  INFO: 30,
  WARN: 40,
  ERROR: 50,
  FATAL: 60,
  AUDIT: 70,
};

const LOG_LEVEL_NAMES = {
  10: 'TRACE',
  20: 'DEBUG',
  30: 'INFO',
  40: 'WARN',
  50: 'ERROR',
  60: 'FATAL',
  70: 'AUDIT',
};

class StructuredLogger {
  constructor(serviceName = 'kcm-backend-api') {
    this.serviceName = serviceName;
    this.environment = process.env.NODE_ENV || 'production';
    this.minLevel = LOG_LEVELS[process.env.LOG_LEVEL?.toUpperCase()] || LOG_LEVELS.INFO;
  }

  _formatMessage(level, message, meta = {}, reqContext = {}) {
    const timestamp = new Date().toISOString();
    
    // Extract error stack if meta contains Error object
    let errorDetails = undefined;
    if (meta instanceof Error) {
      errorDetails = {
        name: meta.name,
        message: meta.message,
        stack: meta.stack,
      };
      meta = {};
    } else if (meta?.error instanceof Error) {
      errorDetails = {
        name: meta.error.name,
        message: meta.error.message,
        stack: meta.error.stack,
      };
      delete meta.error;
    }

    const payload = {
      timestamp,
      level: LOG_LEVEL_NAMES[level] || 'INFO',
      level_code: level,
      service: this.serviceName,
      environment: this.environment,
      message: typeof message === 'object' ? JSON.stringify(message) : message,
      correlation_id: reqContext.correlationId || reqContext.requestId || meta.correlationId || 'none',
      trace_id: reqContext.traceId || meta.traceId || undefined,
      span_id: reqContext.spanId || meta.spanId || undefined,
      user_id: reqContext.userId || meta.userId || undefined,
      user_role: reqContext.userRole || meta.userRole || undefined,
      client_ip: reqContext.clientIp || meta.clientIp || undefined,
      http: reqContext.http || undefined,
      database: meta.database || undefined,
      security: meta.security || undefined,
      ...meta,
    };

    if (errorDetails) {
      payload.error = errorDetails;
    }

    return JSON.stringify(payload);
  }

  _shouldLog(level) {
    return level >= this.minLevel;
  }

  _output(level, formattedMsg) {
    if (level >= LOG_LEVELS.ERROR) {
      process.stderr.write(formattedMsg + '\n');
    } else {
      process.stdout.write(formattedMsg + '\n');
    }
  }

  debug(message, meta = {}, reqContext = {}) {
    if (this._shouldLog(LOG_LEVELS.DEBUG)) {
      this._output(LOG_LEVELS.DEBUG, this._formatMessage(LOG_LEVELS.DEBUG, message, meta, reqContext));
    }
  }

  info(message, meta = {}, reqContext = {}) {
    if (this._shouldLog(LOG_LEVELS.INFO)) {
      this._output(LOG_LEVELS.INFO, this._formatMessage(LOG_LEVELS.INFO, message, meta, reqContext));
    }
  }

  warn(message, meta = {}, reqContext = {}) {
    if (this._shouldLog(LOG_LEVELS.WARN)) {
      this._output(LOG_LEVELS.WARN, this._formatMessage(LOG_LEVELS.WARN, message, meta, reqContext));
    }
  }

  error(message, meta = {}, reqContext = {}) {
    if (this._shouldLog(LOG_LEVELS.ERROR)) {
      this._output(LOG_LEVELS.ERROR, this._formatMessage(LOG_LEVELS.ERROR, message, meta, reqContext));
    }
  }

  fatal(message, meta = {}, reqContext = {}) {
    if (this._shouldLog(LOG_LEVELS.FATAL)) {
      this._output(LOG_LEVELS.FATAL, this._formatMessage(LOG_LEVELS.FATAL, message, meta, reqContext));
    }
  }

  audit(event, details = {}, reqContext = {}) {
    const meta = {
      category: 'AUDIT',
      security: {
        event_type: event,
        severity: details.severity || 'INFO',
        outcome: details.outcome || 'SUCCESS',
        actor: reqContext.userId || details.actor || 'system',
        target_resource: details.resource || undefined,
        reason: details.reason || undefined,
      },
      ...details,
    };
    this._output(LOG_LEVELS.AUDIT, this._formatMessage(LOG_LEVELS.AUDIT, `AUDIT EVENT: ${event}`, meta, reqContext));
  }

  logPrismaQuery(e, reqContext = {}) {
    const durationMs = e.duration;
    const isSlowQuery = durationMs > (parseInt(process.env.SLOW_QUERY_THRESHOLD_MS || '200', 10));
    const meta = {
      category: 'DATABASE',
      database: {
        query: e.query,
        params: e.params,
        duration_ms: durationMs,
        target: e.target,
        is_slow: isSlowQuery,
      },
    };

    if (isSlowQuery) {
      this.warn(`Database Slow Query Detected (${durationMs}ms)`, meta, reqContext);
    } else if (this._shouldLog(LOG_LEVELS.DEBUG)) {
      this.debug('Database Query Executed', meta, reqContext);
    }
  }
}

const logger = new StructuredLogger();
module.exports = { logger, StructuredLogger };
