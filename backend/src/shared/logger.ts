/**
 * src/shared/logger.ts
 * Structured JSON Logger with Sensitive Data Masking and Correlation IDs.
 */

const SENSITIVE_KEYS = new Set([
  'password',
  'token',
  'authorization',
  'cookie',
  'secret',
  'apikey',
  'api_key',
  'key_secret',
  'webhook_secret',
  'private_key',
  'razorpay_signature',
]);

function sanitizeData(data: any, depth = 0): any {
  if (depth > 5) return '[TRUNCATED_DEPTH]';
  if (data === null || data === undefined) return data;
  if (typeof data === 'string') {
    if (data.length > 500) return `${data.slice(0, 100)}...[TRUNCATED ${data.length} bytes]`;
    return data;
  }
  if (typeof data !== 'object') return data;

  if (Array.isArray(data)) {
    return data.map((item) => sanitizeData(item, depth + 1));
  }

  const sanitized: Record<string, any> = {};
  for (const [key, value] of Object.entries(data)) {
    if (SENSITIVE_KEYS.has(key.toLowerCase())) {
      sanitized[key] = '***REDACTED***';
    } else {
      sanitized[key] = sanitizeData(value, depth + 1);
    }
  }
  return sanitized;
}

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

class StructuredLogger {
  private formatLog(level: LogLevel, message: string, context?: Record<string, any>): string {
    const entry = {
      timestamp: new Date().toISOString(),
      level: level.toUpperCase(),
      message,
      ...(context ? sanitizeData(context) : {}),
    };
    return JSON.stringify(entry);
  }

  public info(message: string, context?: Record<string, any>): void {
    console.log(this.formatLog('info', message, context));
  }

  public warn(message: string, context?: Record<string, any>): void {
    console.warn(this.formatLog('warn', message, context));
  }

  public error(message: string, context?: Record<string, any>): void {
    console.error(this.formatLog('error', message, context));
  }

  public debug(message: string, context?: Record<string, any>): void {
    if (process.env.NODE_ENV !== 'production' || process.env.DEBUG === 'true') {
      console.debug(this.formatLog('debug', message, context));
    }
  }
}

export const logger = new StructuredLogger();

