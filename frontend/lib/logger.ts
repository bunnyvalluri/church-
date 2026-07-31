/**
 * frontend/lib/logger.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Structured JSON Logger for Next.js Frontend & API Routes
 * Formats client & server logs with ISO timestamps, severity, correlation IDs,
 * and component context for Grafana Loki log aggregation.
 * ─────────────────────────────────────────────────────────────────────────────
 */

export enum LogLevel {
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
  SECURITY = 'security',
  AUDIT = 'audit',
  DEBUG = 'debug',
}

export interface LogMeta {
  component?: string;
  action?: string;
  path?: string;
  userId?: string;
  correlationId?: string;
  traceId?: string;
  durationMs?: number;
  error?: Error | { name: string; message: string; stack?: string };
  [key: string]: unknown;
}

export function logEvent(level: LogLevel | string, eventName: string, message?: string, meta?: LogMeta) {
  const metaObj = meta || {};
  if (level === LogLevel.SECURITY || level === 'security') {
    logger.warn(`[SECURITY] ${eventName}: ${message || ''}`, metaObj);
  } else if (level === LogLevel.ERROR || level === 'error') {
    logger.error(`${eventName}: ${message || ''}`, metaObj);
  } else if (level === LogLevel.WARN || level === 'warn') {
    logger.warn(`${eventName}: ${message || ''}`, metaObj);
  } else {
    logger.info(`${eventName}: ${message || ''}`, metaObj);
  }
}

class NextLogger {
  private serviceName: string;
  private environment: string;

  constructor() {
    this.serviceName = 'kcm-frontend-nextjs';
    this.environment = process.env.NODE_ENV || 'production';
  }

  private format(level: LogLevel, message: string, meta: LogMeta = {}): string {
    const timestamp = new Date().toISOString();
    
    let errorObj = undefined;
    if (meta.error instanceof Error) {
      errorObj = {
        name: meta.error.name,
        message: meta.error.message,
        stack: meta.error.stack,
      };
      delete meta.error;
    } else if (meta.error) {
      errorObj = meta.error;
    }

    const payload = {
      timestamp,
      level: level.toUpperCase(),
      service: this.serviceName,
      environment: this.environment,
      message,
      correlation_id: meta.correlationId || 'none',
      trace_id: meta.traceId || undefined,
      component: meta.component || 'general',
      path: meta.path || (typeof window !== 'undefined' ? window.location.pathname : undefined),
      user_id: meta.userId || undefined,
      duration_ms: meta.durationMs || undefined,
      error: errorObj,
      meta,
    };

    return JSON.stringify(payload);
  }

  debug(message: string, meta?: LogMeta): void {
    if (process.env.NODE_ENV === 'development') {
      console.debug(this.format('debug', message, meta));
    }
  }

  info(message: string, meta?: LogMeta): void {
    console.info(this.format('info', message, meta));
  }

  warn(message: string, meta?: LogMeta): void {
    console.warn(this.format('warn', message, meta));
  }

  error(message: string, meta?: LogMeta): void {
    console.error(this.format('error', message, meta));
  }

  audit(event: string, details?: LogMeta): void {
    console.info(this.format('audit', `[AUDIT] ${event}`, details));
  }
}

export const logger = new NextLogger();
