/**
 * frontend/lib/email/email.errors.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * KCM Email Delivery Error Classification & Resiliency Utilities
 * ─────────────────────────────────────────────────────────────────────────────
 */

export type EmailErrorCode =
  | 'UNVERIFIED_DOMAIN'
  | 'SANDBOX_RESTRICTION'
  | 'INVALID_RECIPIENT'
  | 'INVALID_CREDENTIALS'
  | 'RATE_LIMIT_EXCEEDED'
  | 'NETWORK_TIMEOUT'
  | 'PROVIDER_5XX'
  | 'SERVERLESS_ABORT'
  | 'UNKNOWN_ERROR';

export interface ClassifiedEmailError {
  isTransient: boolean;
  isPermanent: boolean;
  errorCode: EmailErrorCode;
  message: string;
  httpStatus?: number;
}

export function classifyEmailError(error: any, httpStatus?: number): ClassifiedEmailError {
  const msg = (typeof error === 'string' ? error : error?.message || error?.error || '').toLowerCase();
  const status = httpStatus || error?.statusCode || error?.status || error?.response?.status;

  // 1. Permanent: Unverified Domain / Resend Testing restriction
  if (
    status === 403 ||
    msg.includes('only send testing emails to your own email address') ||
    msg.includes('verify a domain') ||
    msg.includes('validation_error') ||
    msg.includes('forbidden')
  ) {
    return {
      isTransient: false,
      isPermanent: true,
      errorCode: msg.includes('verify a domain') || msg.includes('testing emails')
        ? 'UNVERIFIED_DOMAIN'
        : 'SANDBOX_RESTRICTION',
      message: error?.message || 'Email provider rejected delivery: sender domain is not verified or testing restricted.',
      httpStatus: status || 403,
    };
  }

  // 2. Permanent: Invalid API Key / Authentication
  if (status === 401 || msg.includes('unauthorized') || msg.includes('api key') || msg.includes('invalid credentials')) {
    return {
      isTransient: false,
      isPermanent: true,
      errorCode: 'INVALID_CREDENTIALS',
      message: 'Invalid email provider API key or SMTP credentials.',
      httpStatus: status || 401,
    };
  }

  // 3. Permanent: Invalid Recipient syntax
  if (
    status === 422 ||
    status === 400 ||
    msg.includes('invalid recipient') ||
    msg.includes('invalid email') ||
    msg.includes('missing recipient')
  ) {
    return {
      isTransient: false,
      isPermanent: true,
      errorCode: 'INVALID_RECIPIENT',
      message: 'Invalid recipient email address format.',
      httpStatus: status || 400,
    };
  }

  // 4. Transient: Rate Limiting
  if (status === 429 || msg.includes('rate limit') || msg.includes('too many requests')) {
    return {
      isTransient: true,
      isPermanent: false,
      errorCode: 'RATE_LIMIT_EXCEEDED',
      message: 'Email provider rate limit reached (HTTP 429). Retrying with exponential backoff.',
      httpStatus: 429,
    };
  }

  // 5. Transient: Timeouts and Network Drops
  if (
    status === 408 ||
    status === 504 ||
    msg.includes('timeout') ||
    msg.includes('etimedout') ||
    msg.includes('econnreset') ||
    msg.includes('socket hang up') ||
    msg.includes('connection lost')
  ) {
    return {
      isTransient: true,
      isPermanent: false,
      errorCode: 'NETWORK_TIMEOUT',
      message: 'Network timeout or socket disconnect during email provider dispatch.',
      httpStatus: status || 408,
    };
  }

  // 6. Transient: Provider 5xx Server Errors
  if (status && status >= 500 && status <= 599) {
    return {
      isTransient: true,
      isPermanent: false,
      errorCode: 'PROVIDER_5XX',
      message: `Email provider internal server error (HTTP ${status}).`,
      httpStatus: status,
    };
  }

  // Default: treat unknown errors as permanent to avoid hazardous retry loops
  return {
    isTransient: false,
    isPermanent: true,
    errorCode: 'UNKNOWN_ERROR',
    message: error?.message || String(error) || 'Unknown email delivery error occurred.',
    httpStatus: status,
  };
}

/**
 * Calculates exponential backoff delay with full jitter.
 * backoff = min(maxDelayMs, baseDelayMs * 2^attempt) * rand(0.5, 1.0)
 */
export function calculateBackoffMs(
  attempt: number,
  baseDelayMs: number = 800,
  maxDelayMs: number = 10000
): number {
  const exponential = Math.min(maxDelayMs, baseDelayMs * Math.pow(2, attempt));
  const jitter = 0.5 + Math.random() * 0.5; // Jitter between 50% and 100%
  return Math.floor(exponential * jitter);
}
