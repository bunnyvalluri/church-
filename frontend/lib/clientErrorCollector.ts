/**
 * frontend/lib/clientErrorCollector.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Real-time Client-Side Error Collector & Ring-Buffer.
 *
 * Captures real unhandled exceptions, rejection events, and failed fetch requests
 * in a bounded in-memory buffer (max 10 entries) to provide contextual diagnostics
 * when a user files an issue report.
 * Automatically redacts sensitive fields and tokens.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { sanitizeDiagnosticText } from './issueDiagnostics';

export interface RecordedClientError {
  type: string;
  message: string;
  stack?: string | null;
  timestamp: string;
  sourceUrl?: string;
  httpStatus?: number | null;
}

class ClientErrorCollector {
  private static instance: ClientErrorCollector;
  private buffer: RecordedClientError[] = [];
  private maxCapacity = 10;
  private initialized = false;

  private constructor() {
    if (typeof window !== 'undefined') {
      this.initListeners();
    }
  }

  public static getInstance(): ClientErrorCollector {
    if (!ClientErrorCollector.instance) {
      ClientErrorCollector.instance = new ClientErrorCollector();
    }
    return ClientErrorCollector.instance;
  }

  private initListeners() {
    if (this.initialized || typeof window === 'undefined') return;
    this.initialized = true;

    // 1. window.onerror
    window.addEventListener('error', (event) => {
      this.recordError({
        type: 'window.onerror',
        message: sanitizeDiagnosticText(event.message || 'Unknown window error') || 'Error',
        stack: sanitizeDiagnosticText(event.error?.stack || `${event.filename}:${event.lineno}:${event.colno}`),
        timestamp: new Date().toISOString(),
        sourceUrl: event.filename || window.location.href,
      });
    });

    // 2. unhandledrejection
    window.addEventListener('unhandledrejection', (event) => {
      const reason = event.reason;
      let message = 'Unhandled Promise Rejection';
      let stack: string | null = null;

      if (reason instanceof Error) {
        message = reason.message;
        stack = reason.stack || null;
      } else if (typeof reason === 'string') {
        message = reason;
      } else if (reason && typeof reason === 'object') {
        try {
          message = JSON.stringify(reason);
        } catch (_) {
          message = 'Complex unhandled rejection object';
        }
      }

      this.recordError({
        type: 'unhandledrejection',
        message: sanitizeDiagnosticText(message) || 'Rejection',
        stack: sanitizeDiagnosticText(stack),
        timestamp: new Date().toISOString(),
        sourceUrl: window.location.href,
      });
    });
  }

  public recordError(error: RecordedClientError) {
    if (this.buffer.length >= this.maxCapacity) {
      this.buffer.shift();
    }
    this.buffer.push(error);
  }

  public getRecentErrors(): RecordedClientError[] {
    return [...this.buffer];
  }

  public getLatestError(): RecordedClientError | null {
    return this.buffer.length > 0 ? this.buffer[this.buffer.length - 1] : null;
  }

  public clear() {
    this.buffer = [];
  }
}

export const clientErrorCollector = ClientErrorCollector.getInstance();

export function getRecentErrorContext(): { errorType?: string; errorMessage?: string; errorStack?: string } {
  const latest = clientErrorCollector.getLatestError();
  if (!latest) return {};
  return {
    errorType: latest.type,
    errorMessage: latest.message,
    errorStack: latest.stack || undefined,
  };
}
