import { LRUCache } from '@/lib/lruCache';

type RateEntry = { count: number; lastReset: number };

// Production-grade: Cap in-memory records to 5,000 unique IP addresses to completely
// prevent malicious memory-exhaustion (Out-of-Memory) attacks in persistent server environments.
const store = new LRUCache<string, RateEntry>(5000);

export interface RateLimitOptions {
  windowMs: number;    // time window in ms
  maxRequests: number; // max requests per window
}

// ── Check and record a request for the given IP ──────────────────────────────
export function isRateLimited(ip: string, opts: RateLimitOptions): boolean {
  const now = Date.now();
  const entry = store.get(ip);

  // First request or window expired → reset
  if (!entry || now - entry.lastReset > opts.windowMs) {
    store.put(ip, { count: 1, lastReset: now });
    return false;
  }

  // Over limit
  if (entry.count >= opts.maxRequests) return true;

  // Within window, increment
  entry.count += 1;
  store.put(ip, entry);
  return false;
}

// ── Standard rate limit response headers ─────────────────────────────────────
export function rateLimitHeaders(ip: string, opts: RateLimitOptions) {
  const entry = store.get(ip);
  const remaining = entry
    ? Math.max(0, opts.maxRequests - entry.count)
    : opts.maxRequests;
  const resetEpochSec = entry
    ? Math.ceil((entry.lastReset + opts.windowMs) / 1000)
    : Math.ceil((Date.now() + opts.windowMs) / 1000);

  return {
    'X-RateLimit-Limit': String(opts.maxRequests),
    'X-RateLimit-Remaining': String(remaining),
    'X-RateLimit-Reset': String(resetEpochSec),
  };
}

// ── Get remaining requests for an IP (for diagnostics) ───────────────────────
export function getRateLimitStatus(ip: string, opts: RateLimitOptions) {
  const entry = store.get(ip);
  if (!entry || Date.now() - entry.lastReset > opts.windowMs) {
    return { limited: false, remaining: opts.maxRequests, resetIn: opts.windowMs };
  }
  const remaining = Math.max(0, opts.maxRequests - entry.count);
  const resetIn = Math.max(0, opts.windowMs - (Date.now() - entry.lastReset));
  return { limited: remaining === 0, remaining, resetIn };
}
