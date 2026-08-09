/**
 * frontend/lib/apiClient.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Resilient Client-Side API Request Engine with AbortController, Timeout,
 * Automatic Retries, Deduplication, and Structured Error Handling.
 * ─────────────────────────────────────────────────────────────────────────────
 */

export interface ApiRequestOptions extends RequestInit {
  timeoutMs?: number;
  retries?: number;
  retryDelayMs?: number;
}

export interface ApiResponse<T = any> {
  data: T | null;
  error: string | null;
  status: number;
  ok: boolean;
}

const DEFAULT_TIMEOUT_MS = 10000;
const inFlightRequests = new Map<string, Promise<ApiResponse<any>>>();

export async function apiFetch<T = any>(
  endpoint: string,
  options: ApiRequestOptions = {}
): Promise<ApiResponse<T>> {
  const {
    timeoutMs = DEFAULT_TIMEOUT_MS,
    retries = 1,
    retryDelayMs = 1000,
    headers,
    ...restOptions
  } = options;

  const method = (restOptions.method || "GET").toUpperCase();
  const requestKey = `${method}:${endpoint}`;

  // Deduplicate concurrent GET requests
  if (method === "GET" && inFlightRequests.has(requestKey)) {
    return inFlightRequests.get(requestKey) as Promise<ApiResponse<T>>;
  }

  const executeRequest = async (attempt: number): Promise<ApiResponse<T>> => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(endpoint, {
        ...restOptions,
        headers: {
          "Content-Type": "application/json",
          ...headers,
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      let payload: any = null;
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        payload = await response.json();
      } else {
        const text = await response.text();
        payload = { message: text };
      }

      if (!response.ok) {
        const errorMessage =
          payload?.message ||
          payload?.error ||
          getHttpErrorMessage(response.status);

        // Retry server errors on idempotent GETs
        if (response.status >= 500 && method === "GET" && attempt < retries) {
          await new Promise((res) => setTimeout(res, retryDelayMs));
          return executeRequest(attempt + 1);
        }

        return {
          data: null,
          error: errorMessage,
          status: response.status,
          ok: false,
        };
      }

      return {
        data: payload as T,
        error: null,
        status: response.status,
        ok: true,
      };
    } catch (err: any) {
      clearTimeout(timeoutId);

      const isTimeout = err.name === "AbortError";
      const errorMessage = isTimeout
        ? "Request timed out. Please check your internet connection."
        : err.message || "Network error occurred.";

      if (method === "GET" && attempt < retries) {
        await new Promise((res) => setTimeout(res, retryDelayMs));
        return executeRequest(attempt + 1);
      }

      return {
        data: null,
        error: errorMessage,
        status: isTimeout ? 408 : 0,
        ok: false,
      };
    }
  };

  const promise = executeRequest(0).finally(() => {
    if (method === "GET") {
      inFlightRequests.delete(requestKey);
    }
  });

  if (method === "GET") {
    inFlightRequests.set(requestKey, promise);
  }

  return promise;
}

function getHttpErrorMessage(status: number): string {
  switch (status) {
    case 400:
      return "Bad request. Please check your submission.";
    case 401:
      return "Authentication required. Please log in.";
    case 403:
      return "Access denied. You do not have permission.";
    case 404:
      return "Resource not found.";
    case 409:
      return "Conflict detected. Please refresh and try again.";
    case 422:
      return "Validation failed. Please verify input data.";
    case 429:
      return "Too many requests. Please slow down.";
    case 500:
      return "Internal server error. Please try again later.";
    case 502:
      return "Bad gateway. Server is temporary unreachable.";
    case 503:
      return "Service unavailable. Maintenance in progress.";
    case 504:
      return "Gateway timeout. Please try again.";
    default:
      return `Unexpected error occurred (Status ${status}).`;
  }
}
