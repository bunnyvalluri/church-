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

export interface ApiRequestOptions<T = any> extends Omit<RequestInit, "signal"> {
  timeoutMs?: number;
  retries?: number;
  baseDelayMs?: number;
  maxDelayMs?: number;
  signal?: AbortSignal;
  validate?: (data: unknown) => T;
  idempotencyKey?: string;
}

export interface ApiResponse<T = any> {
  data: T | null;
  error: string | null;
  status: number;
  ok: boolean;
  classification: ErrorClassification | null;
  requestId?: string;
}

const DEFAULT_TIMEOUT_MS = 10000;
const DEFAULT_RETRIES = 2;
const DEFAULT_BASE_DELAY_MS = 400;
const DEFAULT_MAX_DELAY_MS = 5000;

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
    ...restOptions
  } = options;

  const method = (restOptions.method || "GET").toUpperCase();
  const isSafeMethod = method === "GET" || method === "HEAD";
  const requestKey = `${method}:${endpoint}`;

  // Deduplicate concurrent in-flight GET requests
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
        };
      }

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

      return {
        data: validatedData,
        error: null,
        status: response.status,
        ok: true,
        classification: null,
        requestId,
      };
    } catch (err: any) {
      clearTimeout(timeoutId);
      if (cleanupExternalListener) cleanupExternalListener();

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
