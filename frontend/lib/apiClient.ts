/**
 * frontend/lib/apiClient.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Resilient Centralized Client-Side API Engine for KCM Platform.
 *
 * Features:
 *  • Exponential backoff with random jitter (prevents thundering herd)
 *  • AbortController timeout & external cancellation linking
 *  • Deduplication of concurrent identical GET requests
 *  • Automatic Idempotency-Key attachment on state mutations
 *  • Granular HTTP status classification (400, 401, 403, 404, 409, 422, 429, 500, 502, 503, 504)
 *  • Optional response schema validation
 *  • Normalized structured error reporting
 * ─────────────────────────────────────────────────────────────────────────────
 */

export type ErrorClassification =
  | "VALIDATION_ERROR"
  | "AUTH_REQUIRED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "CONFLICT"
  | "RATE_LIMITED"
  | "SERVER_ERROR"
  | "TIMEOUT"
  | "NETWORK_ERROR"
  | "UNKNOWN";

export interface ApiRequestOptions<T = any> extends Omit<RequestInit, "signal" | "cache"> {
  timeoutMs?: number;
  retries?: number;
  baseDelayMs?: number;
  maxDelayMs?: number;
  signal?: AbortSignal;
  validate?: (data: unknown) => T;
  idempotencyKey?: string;
  cache?: boolean | RequestCache;
  cacheTtlMs?: number;
  staleWhileRevalidate?: boolean;
  forceRefresh?: boolean;
}

export interface ApiResponse<T = any> {
  data: T | null;
  error: string | null;
  status: number;
  ok: boolean;
  classification: ErrorClassification | null;
  requestId?: string;
  isCached?: boolean;
  isStale?: boolean;
  retryAfter?: number;
}

const DEFAULT_TIMEOUT_MS = 10000;
const DEFAULT_RETRIES = 2;
const DEFAULT_BASE_DELAY_MS = 400;
const DEFAULT_MAX_DELAY_MS = 5000;
const DEFAULT_CACHE_TTL_MS = 60000; // 1 minute default cache for GET

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
  status: number;
  requestId?: string;
}

// In-memory LRU-like response cache with TTL & SWR support
class ResponseCache {
  private cache = new Map<string, CacheEntry<any>>();
  private maxEntries = 200;

  get<T>(key: string): { entry: CacheEntry<T> | null; isStale: boolean } {
    const entry = this.cache.get(key);
    if (!entry) return { entry: null, isStale: false };

    const isExpired = Date.now() - entry.timestamp > entry.ttl;
    return { entry, isStale: isExpired };
  }

  set<T>(key: string, data: T, ttl: number, status: number, requestId?: string): void {
    // Evict oldest if capacity exceeded
    if (this.cache.size >= this.maxEntries) {
      const oldestKey = this.cache.keys().next().value;
      if (oldestKey) this.cache.delete(oldestKey);
    }
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
      status,
      requestId,
    });
  }

  delete(key: string): void {
    this.cache.delete(key);
  }

  invalidate(pattern?: string | RegExp): void {
    if (!pattern) {
      this.cache.clear();
      return;
    }
    const regex = typeof pattern === "string" ? new RegExp(pattern) : pattern;
    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.cache.delete(key);
      }
    }
  }

  clear(): void {
    this.cache.clear();
  }

  size(): number {
    return this.cache.size;
  }
}

export const responseCache = new ResponseCache();

// Circuit breaker & rate-limit tracker to prevent blocked/cascading requests
interface CircuitBreakerState {
  failures: number;
  lastFailureTime: number;
  nextAttemptTime: number;
  isRateLimited: boolean;
}

const circuitBreakers = new Map<string, CircuitBreakerState>();
const CIRCUIT_THRESHOLD = 4;
const CIRCUIT_COOLDOWN_MS = 15000;

function getCircuitBreaker(origin: string): CircuitBreakerState {
  let cb = circuitBreakers.get(origin);
  if (!cb) {
    cb = { failures: 0, lastFailureTime: 0, nextAttemptTime: 0, isRateLimited: false };
    circuitBreakers.set(origin, cb);
  }
  return cb;
}

function tripCircuit(origin: string, retryAfterMs = CIRCUIT_COOLDOWN_MS, isRateLimit = false): void {
  const cb = getCircuitBreaker(origin);
  cb.failures++;
  cb.lastFailureTime = Date.now();
  cb.nextAttemptTime = Date.now() + retryAfterMs;
  cb.isRateLimited = isRateLimit;
}

function resetCircuit(origin: string): void {
  const cb = circuitBreakers.get(origin);
  if (cb) {
    cb.failures = 0;
    cb.nextAttemptTime = 0;
    cb.isRateLimited = false;
  }
}

function isCircuitOpen(origin: string): { open: boolean; waitMs: number; isRateLimited: boolean } {
  const cb = circuitBreakers.get(origin);
  if (!cb) return { open: false, waitMs: 0, isRateLimited: false };

  const now = Date.now();
  if (cb.nextAttemptTime > now && (cb.failures >= CIRCUIT_THRESHOLD || cb.isRateLimited)) {
    return { open: true, waitMs: cb.nextAttemptTime - now, isRateLimited: cb.isRateLimited };
  }

  if (now >= cb.nextAttemptTime && cb.failures >= CIRCUIT_THRESHOLD) {
    // Half-open attempt: allow one test request
    cb.failures = CIRCUIT_THRESHOLD - 1;
  }

  return { open: false, waitMs: 0, isRateLimited: false };
}

const inFlightRequests = new Map<string, Promise<ApiResponse<any>>>();

function generateIdempotencyKey(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `kcm-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

function calculateBackoff(attempt: number, baseDelay: number, maxDelay: number): number {
  const exponential = Math.min(maxDelay, baseDelay * Math.pow(2, attempt));
  // Add jitter between 0 and 200ms
  const jitter = Math.floor(Math.random() * 200);
  return exponential + jitter;
}

export function classifyHttpStatus(status: number): ErrorClassification {
  if (status === 400 || status === 422) return "VALIDATION_ERROR";
  if (status === 401) return "AUTH_REQUIRED";
  if (status === 403) return "FORBIDDEN";
  if (status === 404) return "NOT_FOUND";
  if (status === 409) return "CONFLICT";
  if (status === 429) return "RATE_LIMITED";
  if (status === 408 || status === 504) return "TIMEOUT";
  if (status >= 500) return "SERVER_ERROR";
  return "UNKNOWN";
}

export function getHttpErrorMessage(status: number): string {
  switch (status) {
    case 400:
      return "Bad request. Please verify the submitted data.";
    case 401:
      return "Authentication required. Please sign in to continue.";
    case 403:
      return "Access denied. You do not have permission for this action.";
    case 404:
      return "The requested resource was not found.";
    case 409:
      return "Conflict detected. The resource may have been modified elsewhere.";
    case 422:
      return "Validation failed. Please verify all required fields.";
    case 429:
      return "Too many requests. Please wait a moment before trying again.";
    case 500:
      return "Internal server error. Our engineering team has been notified.";
    case 502:
      return "Bad gateway. The upstream companion service is currently unreachable.";
    case 503:
      return "Service unavailable. Scheduled maintenance in progress.";
    case 504:
      return "Gateway timeout. The server took too long to respond.";
    default:
      return `Unexpected error occurred (HTTP ${status}).`;
  }
}

export async function apiFetch<T = any>(
  endpoint: string,
  options: ApiRequestOptions<T> = {}
): Promise<ApiResponse<T>> {
  const {
    timeoutMs = DEFAULT_TIMEOUT_MS,
    retries = DEFAULT_RETRIES,
    baseDelayMs = DEFAULT_BASE_DELAY_MS,
    maxDelayMs = DEFAULT_MAX_DELAY_MS,
    signal: externalSignal,
    validate,
    idempotencyKey,
    headers,
    cache,
    cacheTtlMs = DEFAULT_CACHE_TTL_MS,
    staleWhileRevalidate = true,
    forceRefresh = false,
    ...restOptions
  } = options;

  const method = (restOptions.method || "GET").toUpperCase();
  const isSafeMethod = method === "GET" || method === "HEAD";
  const requestKey = `${method}:${endpoint}`;
  const shouldCache = cache !== false && isSafeMethod;
  const origin = typeof window !== "undefined" && endpoint.startsWith("http")
    ? new URL(endpoint).origin
    : "kcm-api";

  // 1. Check cache for safe requests
  const { entry: cachedEntry, isStale } = shouldCache
    ? responseCache.get<T>(requestKey)
    : { entry: null, isStale: false };

  if (cachedEntry && !forceRefresh) {
    if (!isStale) {
      return {
        data: cachedEntry.data,
        error: null,
        status: cachedEntry.status,
        ok: true,
        classification: null,
        requestId: cachedEntry.requestId,
        isCached: true,
        isStale: false,
      };
    }

    // Stale-While-Revalidate: return stale data immediately and trigger background refresh
    if (staleWhileRevalidate && !inFlightRequests.has(requestKey)) {
      // Background revalidation
      apiFetch<T>(endpoint, { ...options, staleWhileRevalidate: false, forceRefresh: true }).catch(() => {
        // Silently capture background revalidation error
      });

      return {
        data: cachedEntry.data,
        error: null,
        status: cachedEntry.status,
        ok: true,
        classification: null,
        requestId: cachedEntry.requestId,
        isCached: true,
        isStale: true,
      };
    }
  }

  // 2. Check Circuit Breaker & Rate Limit Shield to prevent blocked requests
  const circuit = isCircuitOpen(origin);
  if (circuit.open) {
    // If cached data is available (even stale), return it rather than failing
    if (cachedEntry) {
      return {
        data: cachedEntry.data,
        error: null,
        status: cachedEntry.status,
        ok: true,
        classification: null,
        requestId: cachedEntry.requestId,
        isCached: true,
        isStale: true,
        retryAfter: Math.ceil(circuit.waitMs / 1000),
      };
    }

    return {
      data: null,
      error: circuit.isRateLimited
        ? "Requests are temporarily rate-limited. Please wait a few seconds."
        : "Service is temporarily recovering. Please try again shortly.",
      status: circuit.isRateLimited ? 429 : 503,
      ok: false,
      classification: circuit.isRateLimited ? "RATE_LIMITED" : "SERVER_ERROR",
      retryAfter: Math.ceil(circuit.waitMs / 1000),
    };
  }

  // Deduplicate concurrent in-flight safe requests
  if (isSafeMethod && inFlightRequests.has(requestKey)) {
    return inFlightRequests.get(requestKey) as Promise<ApiResponse<T>>;
  }

  // Idempotency key injection for mutations
  const finalHeaders: Record<string, string> = {
    "Content-Type": "application/json",
    ...(headers as Record<string, string>),
  };

  if (!isSafeMethod && !finalHeaders["Idempotency-Key"]) {
    finalHeaders["Idempotency-Key"] = idempotencyKey || generateIdempotencyKey();
  }

  const executeRequest = async (attempt: number): Promise<ApiResponse<T>> => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    // Link external cancellation signal if provided
    let cleanupExternalListener: (() => void) | null = null;
    if (externalSignal) {
      if (externalSignal.aborted) {
        clearTimeout(timeoutId);
        return {
          data: null,
          error: "Request cancelled by user.",
          status: 0,
          ok: false,
          classification: "TIMEOUT",
        };
      }
      const onExternalAbort = () => controller.abort();
      externalSignal.addEventListener("abort", onExternalAbort);
      cleanupExternalListener = () => externalSignal.removeEventListener("abort", onExternalAbort);
    }

    try {
      const response = await fetch(endpoint, {
        ...restOptions,
        method,
        headers: finalHeaders,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      if (cleanupExternalListener) cleanupExternalListener();

      const requestId = response.headers.get("x-request-id") || undefined;
      const contentType = response.headers.get("content-type");

      let payload: any = null;
      if (contentType && contentType.includes("application/json")) {
        try {
          payload = await response.json();
        } catch {
          payload = null;
        }
      } else {
        const text = await response.text();
        payload = text ? { message: text } : null;
      }

      if (!response.ok) {
        const retryAfterHeader = response.headers.get("retry-after");
        const retryAfterSec = retryAfterHeader ? parseInt(retryAfterHeader, 10) : 15;

        // Trip circuit breaker on rate limiting or 5xx to protect downstream services
        if (response.status === 429) {
          tripCircuit(origin, (isNaN(retryAfterSec) ? 15 : retryAfterSec) * 1000, true);
        } else if (response.status >= 500) {
          tripCircuit(origin, CIRCUIT_COOLDOWN_MS, false);
        }

        // Resilient Fallback: If cached data exists for this endpoint, serve it gracefully
        if (cachedEntry) {
          return {
            data: cachedEntry.data,
            error: null,
            status: cachedEntry.status,
            ok: true,
            classification: null,
            requestId: cachedEntry.requestId,
            isCached: true,
            isStale: true,
            retryAfter: response.status === 429 ? retryAfterSec : undefined,
          };
        }

        const classification = classifyHttpStatus(response.status);
        const errorMessage =
          payload?.error?.message ||
          payload?.error ||
          payload?.message ||
          getHttpErrorMessage(response.status);

        // Safe automatic retry for server errors (500, 502, 503, 504) or rate limit (429) ONLY on idempotent GET
        const isRetryableStatus = response.status >= 500 || response.status === 429;
        if (isSafeMethod && isRetryableStatus && attempt < retries) {
          const delay = calculateBackoff(attempt, baseDelayMs, maxDelayMs);
          await new Promise((res) => setTimeout(res, delay));
          return executeRequest(attempt + 1);
        }

        return {
          data: null,
          error: errorMessage,
          status: response.status,
          ok: false,
          classification,
          requestId,
          retryAfter: response.status === 429 ? retryAfterSec : undefined,
        };
      }

      // Success: reset circuit breaker
      resetCircuit(origin);

      // Optional runtime schema validation
      let validatedData = payload as T;
      if (validate && payload !== null) {
        try {
          validatedData = validate(payload);
        } catch (valErr: any) {
          return {
            data: null,
            error: `Response schema validation failed: ${valErr?.message || valErr}`,
            status: 200,
            ok: false,
            classification: "VALIDATION_ERROR",
            requestId,
          };
        }
      }

      // Cache successful response for safe requests
      if (shouldCache && validatedData !== null) {
        responseCache.set(requestKey, validatedData, cacheTtlMs, response.status, requestId);
      }

      return {
        data: validatedData,
        error: null,
        status: response.status,
        ok: true,
        classification: null,
        requestId,
        isCached: false,
        isStale: false,
      };
    } catch (err: any) {
      clearTimeout(timeoutId);
      if (cleanupExternalListener) cleanupExternalListener();

      // Trip circuit breaker on network failure
      tripCircuit(origin, CIRCUIT_COOLDOWN_MS, false);

      // Resilient Fallback: If cached data exists, return it instead of throwing network error
      if (cachedEntry) {
        return {
          data: cachedEntry.data,
          error: null,
          status: cachedEntry.status,
          ok: true,
          classification: null,
          requestId: cachedEntry.requestId,
          isCached: true,
          isStale: true,
        };
      }

      const isTimeout = err.name === "AbortError";
      const classification: ErrorClassification = isTimeout ? "TIMEOUT" : "NETWORK_ERROR";
      const errorMessage = isTimeout
        ? "Request timed out. Please check your internet connection."
        : err.message || "A network connectivity error occurred.";

      // Safe retry for transient network failure or timeout on idempotent GET
      if (isSafeMethod && attempt < retries) {
        const delay = calculateBackoff(attempt, baseDelayMs, maxDelayMs);
        await new Promise((res) => setTimeout(res, delay));
        return executeRequest(attempt + 1);
      }

      return {
        data: null,
        error: errorMessage,
        status: isTimeout ? 408 : 0,
        ok: false,
        classification,
      };
    }
  };

  const promise = executeRequest(0).finally(() => {
    if (isSafeMethod) {
      inFlightRequests.delete(requestKey);
    }
  });

  if (isSafeMethod) {
    inFlightRequests.set(requestKey, promise);
  }

  return promise;
}
