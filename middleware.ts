import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// ── Rate limit config ─────────────────────────────────────────────────────────
const RATE_LIMIT_WINDOW_MS = 60_000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 100; // per IP

// API routes get stricter limits
const API_RATE_LIMIT_WINDOW_MS = 60_000;
const API_MAX_REQUESTS = 30;

const rateLimitMap = new Map<string, { count: number; lastReset: number }>();

function checkRateLimit(ip: string, windowMs: number, max: number): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry || now - entry.lastReset > windowMs) {
    rateLimitMap.set(ip, { count: 1, lastReset: now });
    return false; // not limited
  }

  entry.count += 1;
  rateLimitMap.set(ip, entry);
  return entry.count > max; // true = blocked
}

// ── Bot / suspicious UA detection ────────────────────────────────────────────
const BAD_BOT_PATTERNS = [
  /sqlmap/i, /nikto/i, /nmap/i, /masscan/i, /curl\/7\.[0-3]/i,
];

function isSuspiciousBot(ua: string | null): boolean {
  if (!ua) return false;
  return BAD_BOT_PATTERNS.some((p) => p.test(ua));
}

// ── Security headers ─────────────────────────────────────────────────────────
function applySecurityHeaders(response: NextResponse): NextResponse {
  // Prevent XSS
  response.headers.set('X-XSS-Protection', '1; mode=block');
  // Prevent clickjacking
  response.headers.set('X-Frame-Options', 'DENY');
  // Prevent MIME sniffing
  response.headers.set('X-Content-Type-Options', 'nosniff');
  // Control referrer info
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  // Force HTTPS (1 year)
  response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  // Restrict browser features
  response.headers.set(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=(), payment=(), usb=()'
  );
  // Basic Content Security Policy
  response.headers.set(
    'Content-Security-Policy',
    [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://apis.google.com https://www.gstatic.com https://www.googletagmanager.com https://maps.googleapis.com https://maps.gstatic.com https://checkout.razorpay.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data: blob: https:",
      "connect-src 'self' https://*.firebaseio.com https://*.googleapis.com https://openrouter.ai https://*.firebaseapp.com https://api.razorpay.com",
      "frame-src 'self' https://accounts.google.com https://www.google.com https://google.com https://www.youtube.com https://youtube.com https://*.firebaseapp.com https://api.razorpay.com https://checkout.razorpay.com",
    ].join('; ')
  );
  return response;
}

// ── Main middleware ──────────────────────────────────────────────────────────
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isApiRoute = pathname.startsWith('/api/');
  const ip =
    request.ip ??
    request.headers.get('x-forwarded-for')?.split(',')[0].trim() ??
    request.headers.get('cf-connecting-ip') ??
    'unknown';
  const ua = request.headers.get('user-agent');

  // 1. Block known bad bots immediately
  if (isSuspiciousBot(ua)) {
    console.warn(`[SECURITY] Blocked suspicious bot UA from ${ip}: ${ua}`);
    return new NextResponse(null, { status: 403 });
  }

  // 2. Apply stricter rate limit on API routes
  if (isApiRoute) {
    const limited = checkRateLimit(
      `api:${ip}`,
      API_RATE_LIMIT_WINDOW_MS,
      API_MAX_REQUESTS
    );
    if (limited) {
      console.warn(`[SECURITY] API rate limit exceeded for IP: ${ip} on ${pathname}`);
      return new NextResponse(
        JSON.stringify({ error: 'Too Many Requests', retryAfter: 60 }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'Retry-After': '60',
            'X-RateLimit-Limit': String(API_MAX_REQUESTS),
          },
        }
      );
    }
  }

  // 3. Apply global rate limit on all routes
  const globalLimited = checkRateLimit(ip, RATE_LIMIT_WINDOW_MS, MAX_REQUESTS_PER_WINDOW);
  if (globalLimited) {
    console.warn(`[SECURITY] Global rate limit exceeded for IP: ${ip}`);
    return new NextResponse('Too Many Requests', {
      status: 429,
      headers: { 'Retry-After': '60' },
    });
  }

  // 4. Pass through with security headers
  const response = NextResponse.next();
  return applySecurityHeaders(response);
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
