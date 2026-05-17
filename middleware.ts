import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// In-memory cache for rate limiting. 
// Note: In a true serverless environment (like Vercel Edge), this map 
// will be isolated per region/instance. For a distributed production app, 
// consider using Redis (e.g., Upstash) for global rate limiting.
const rateLimitMap = new Map<string, { count: number; lastReset: number }>();

// Configuration
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 100; // Max requests per IP per window

export function middleware(request: NextRequest) {
  // Extract the IP address from the request
  const ip = request.ip ?? request.headers.get('x-forwarded-for') ?? 'unknown-ip';

  const currentTime = Date.now();
  const clientLimit = rateLimitMap.get(ip);

  if (!clientLimit) {
    // First time seeing this IP
    rateLimitMap.set(ip, { count: 1, lastReset: currentTime });
  } else {
    // Check if the window has expired
    if (currentTime - clientLimit.lastReset > RATE_LIMIT_WINDOW_MS) {
      // Reset the window
      rateLimitMap.set(ip, { count: 1, lastReset: currentTime });
    } else {
      // Increment the count
      clientLimit.count += 1;

      // Check if the limit is exceeded
      if (clientLimit.count > MAX_REQUESTS_PER_WINDOW) {
        // Log the security event (useful for SIEM or monitoring)
        console.warn(`[SECURITY] Rate limit exceeded for IP: ${ip}`);
        
        // Return 429 Too Many Requests
        return new NextResponse(
          JSON.stringify({ 
            error: 'Too Many Requests',
            message: 'You have exceeded the rate limit. Please try again later.'
          }),
          { 
            status: 429, 
            headers: { 
              'Content-Type': 'application/json',
              'Retry-After': Math.ceil(RATE_LIMIT_WINDOW_MS / 1000).toString(),
            } 
          }
        );
      }
      
      // Update the map
      rateLimitMap.set(ip, clientLimit);
    }
  }

  // Add security headers to the response
  const response = NextResponse.next();
  
  // Content Security Policy
  const cspHeader = `
    default-src 'self';
    script-src 'self' 'unsafe-eval' 'unsafe-inline';
    style-src 'self' 'unsafe-inline';
    img-src 'self' blob: data: https:;
    font-src 'self' data:;
    object-src 'none';
    base-uri 'self';
    form-action 'self';
    frame-ancestors 'none';
    upgrade-insecure-requests;
  `;
  const contentSecurityPolicyHeaderValue = cspHeader.replace(/\s{2,}/g, ' ').trim();

  // Security Headers
  response.headers.set('Content-Security-Policy', contentSecurityPolicyHeaderValue);
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');

  return response;
}

// Specify which routes the middleware should run on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public (public assets)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
