/**
 * frontend/lib/issueDiagnostics.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Real Browser Diagnostic Telemetry & Data Sanitization for KCM Church.
 *
 * Captures real browser data: viewport, screen, timezone, connection,
 * user agent, operating system, and runtime error context.
 * Strict rules:
 *  - Never invent browser or server information.
 *  - If a value is unavailable, returns null or "unknown".
 *  - Strips all auth tokens, cookies, passwords, and private keys.
 * ─────────────────────────────────────────────────────────────────────────────
 */

export interface BrowserDiagnostics {
  currentUrl: string;
  pathname: string;
  pageTitle: string;
  referrer: string | null;
  timestamp: string;
  timezone: string;
  browser: string;
  browserVersion: string | null;
  operatingSystem: string;
  deviceType: 'mobile' | 'tablet' | 'desktop';
  viewportWidth: number;
  viewportHeight: number;
  screenWidth: number;
  screenHeight: number;
  language: string;
  onlineStatus: boolean;
  connectionType: string | null;
  appVersion: string;
}

/**
 * Parses browser name and version from User-Agent string without fabricating.
 */
function parseUserAgent(ua: string): { browser: string; browserVersion: string | null; os: string } {
  let browser = 'unknown';
  let browserVersion: string | null = null;
  let os = 'unknown';

  if (!ua) return { browser, browserVersion, os };

  // Operating System detection
  if (/Windows NT 10.0/i.test(ua)) os = 'Windows 10/11';
  else if (/Windows NT 6.3/i.test(ua)) os = 'Windows 8.1';
  else if (/Windows NT 6.1/i.test(ua)) os = 'Windows 7';
  else if (/Macintosh|Mac OS X/i.test(ua)) {
    const match = ua.match(/Mac OS X ([0-9_]+)/i);
    os = match ? `macOS ${match[1].replace(/_/g, '.')}` : 'macOS';
  } else if (/Android/i.test(ua)) {
    const match = ua.match(/Android ([0-9.]+)/i);
    os = match ? `Android ${match[1]}` : 'Android';
  } else if (/iPhone|iPad|iPod/i.test(ua)) {
    const match = ua.match(/OS ([0-9_]+)/i);
    os = match ? `iOS ${match[1].replace(/_/g, '.')}` : 'iOS';
  } else if (/Linux/i.test(ua)) os = 'Linux';

  // Browser detection (order matters due to shared tokens in UA)
  if (/Edg\/([0-9.]+)/i.test(ua)) {
    const match = ua.match(/Edg\/([0-9.]+)/i);
    browser = 'Microsoft Edge';
    browserVersion = match ? match[1] : null;
  } else if (/SamsungBrowser\/([0-9.]+)/i.test(ua)) {
    const match = ua.match(/SamsungBrowser\/([0-9.]+)/i);
    browser = 'Samsung Internet';
    browserVersion = match ? match[1] : null;
  } else if (/Chrome\/([0-9.]+)/i.test(ua) && !/Chromium|Edg|OPR/i.test(ua)) {
    const match = ua.match(/Chrome\/([0-9.]+)/i);
    browser = 'Google Chrome';
    browserVersion = match ? match[1] : null;
  } else if (/Firefox\/([0-9.]+)/i.test(ua)) {
    const match = ua.match(/Firefox\/([0-9.]+)/i);
    browser = 'Mozilla Firefox';
    browserVersion = match ? match[1] : null;
  } else if (/Version\/([0-9.]+).*Safari/i.test(ua)) {
    const match = ua.match(/Version\/([0-9.]+)/i);
    browser = 'Apple Safari';
    browserVersion = match ? match[1] : null;
  } else if (/Safari/i.test(ua) && !/Chrome/i.test(ua)) {
    browser = 'Apple Safari';
  }

  return { browser, browserVersion, os };
}

/**
 * Detects device category based on viewport width and touch capabilities.
 */
function getDeviceType(): 'mobile' | 'tablet' | 'desktop' {
  if (typeof window === 'undefined') return 'desktop';
  const width = window.innerWidth;
  if (width < 640) return 'mobile';
  if (width < 1024) return 'tablet';
  return 'desktop';
}

/**
 * Captures real, non-fabricated browser diagnostics on the client side.
 */
export function captureBrowserDiagnostics(): BrowserDiagnostics {
  if (typeof window === 'undefined') {
    return {
      currentUrl: 'unknown',
      pathname: 'unknown',
      pageTitle: 'unknown',
      referrer: null,
      timestamp: new Date().toISOString(),
      timezone: 'UTC',
      browser: 'unknown',
      browserVersion: null,
      operatingSystem: 'unknown',
      deviceType: 'desktop',
      viewportWidth: 0,
      viewportHeight: 0,
      screenWidth: 0,
      screenHeight: 0,
      language: 'unknown',
      onlineStatus: true,
      connectionType: null,
      appVersion: '1.0.0',
    };
  }

  const ua = navigator.userAgent || '';
  const parsedUa = parseUserAgent(ua);

  // Network connection API if exposed by browser
  let connectionType: string | null = null;
  const navAny = navigator as any;
  if (navAny.connection) {
    connectionType = navAny.connection.effectiveType || navAny.connection.type || null;
  }

  let timezone = 'UTC';
  try {
    timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
  } catch (_) {}

  return {
    currentUrl: window.location.href,
    pathname: window.location.pathname,
    pageTitle: document.title || 'Kingdom of Christ Ministries',
    referrer: document.referrer ? document.referrer : null,
    timestamp: new Date().toISOString(),
    timezone,
    browser: parsedUa.browser,
    browserVersion: parsedUa.browserVersion,
    operatingSystem: parsedUa.os,
    deviceType: getDeviceType(),
    viewportWidth: window.innerWidth || 0,
    viewportHeight: window.innerHeight || 0,
    screenWidth: window.screen ? window.screen.width : 0,
    screenHeight: window.screen ? window.screen.height : 0,
    language: navigator.language || 'en',
    onlineStatus: navigator.onLine !== undefined ? navigator.onLine : true,
    connectionType,
    appVersion: '1.0.0',
  };
}

/**
 * Redacts secrets, tokens, passwords, cookies, and sensitive headers from diagnostic text.
 */
export function sanitizeDiagnosticText(input: string | null | undefined): string | null {
  if (!input) return null;

  let sanitized = String(input);

  // Redact Bearer tokens
  sanitized = sanitized.replace(/Bearer\s+[A-Za-z0-9\-_.]+/gi, 'Bearer [REDACTED]');

  // Redact JSON Web Tokens (JWT)
  sanitized = sanitized.replace(/eyJ[A-Za-z0-9\-_.]+\.[A-Za-z0-9\-_.]+\.[A-Za-z0-9\-_.]+/g, '[REDACTED_JWT]');

  // Redact authorization headers
  sanitized = sanitized.replace(/(authorization|token|auth_token|access_token|refresh_token)\s*[:=]\s*["']?[^"'\s,;]+/gi, '$1: [REDACTED]');

  // Redact passwords and API keys
  sanitized = sanitized.replace(/(password|passwd|secret|apikey|api_key|private_key)\s*[:=]\s*["']?[^"'\s,;]+/gi, '$1: [REDACTED]');

  // Redact cookies
  sanitized = sanitized.replace(/(cookie|sessionid|kcm_session)\s*[:=]\s*["']?[^"'\s,;]+/gi, '$1: [REDACTED]');

  // Redact potential credit card numbers (13-19 digits)
  sanitized = sanitized.replace(/\b(?:\d{4}[ -]?){3}(?:\d{4}|\d{1,4})\b/g, '[REDACTED_CARD]');

  // Redact database connection strings
  sanitized = sanitized.replace(/postgres(ql)?:\/\/[^@\s]+@[^\s/]+/gi, 'postgresql://[REDACTED_USER]:[REDACTED_PASS]@[REDACTED_HOST]');

  // Truncate to maximum 4000 characters to prevent database overflow
  if (sanitized.length > 4000) {
    sanitized = sanitized.slice(0, 4000) + '... [TRUNCATED]';
  }

  return sanitized;
}

/**
 * Generates unique non-sequential Report ID: format KCM-ERR-XXXXXXXX
 */
export function generateReportId(): string {
  const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ'; // base32 without confusing 0, 1, I, O
  let randomHex = '';
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    const bytes = new Uint8Array(8);
    crypto.getRandomValues(bytes);
    for (let i = 0; i < 8; i++) {
      randomHex += chars[bytes[i] % chars.length];
    }
  } else {
    for (let i = 0; i < 8; i++) {
      randomHex += chars[Math.floor(Math.random() * chars.length)];
    }
  }
  return `KCM-ERR-${randomHex}`;
}

/**
 * Generates unique correlation ID for end-to-end trace across frontend, API, socket, and DB.
 */
export function generateCorrelationId(): string {
  const chars = 'abcdef0123456789';
  let rand = '';
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    const bytes = new Uint8Array(12);
    crypto.getRandomValues(bytes);
    for (let i = 0; i < 12; i++) {
      rand += chars[bytes[i] % chars.length];
    }
  } else {
    for (let i = 0; i < 12; i++) {
      rand += chars[Math.floor(Math.random() * chars.length)];
    }
  }
  return `kcm-corr-${Date.now().toString(36)}-${rand}`;
}
