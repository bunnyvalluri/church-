/**
 * src/services/apiClient.ts
 * Enterprise Typed HTTP API Client with correlation IDs, circuit breaker,
 * timeout handling, idempotency, and error classification.
 */

import {
  apiFetch,
  ApiRequestOptions,
  ApiResponse,
  ErrorClassification,
} from '../../lib/apiClient';

export interface RequestConfig<T = any> extends ApiRequestOptions<T> {
  params?: Record<string, string | number | boolean | undefined>;
}

export class ApiService {
  private baseUrl: string;

  constructor(baseUrl = process.env.NEXT_PUBLIC_API_URL || '') {
    this.baseUrl = baseUrl.replace(/\/$/, '');
  }

  private buildUrl(path: string, params?: Record<string, string | number | boolean | undefined>): string {
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    const fullUrl = this.baseUrl ? `${this.baseUrl}${cleanPath}` : cleanPath;

    if (!params) return fullUrl;

    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null) {
        query.append(key, String(val));
      }
    });

    const queryString = query.toString();
    return queryString ? `${fullUrl}?${queryString}` : fullUrl;
  }

  async get<T>(path: string, config?: RequestConfig<T>): Promise<ApiResponse<T>> {
    const url = this.buildUrl(path, config?.params);
    return apiFetch<T>(url, {
      method: 'GET',
      ...config,
    });
  }

  async post<T>(path: string, body?: unknown, config?: RequestConfig<T>): Promise<ApiResponse<T>> {
    const url = this.buildUrl(path, config?.params);
    return apiFetch<T>(url, {
      method: 'POST',
      body: body !== undefined ? JSON.stringify(body) : undefined,
      headers: {
        'Content-Type': 'application/json',
        ...(config?.headers as Record<string, string>),
      },
      ...config,
    });
  }

  async put<T>(path: string, body?: unknown, config?: RequestConfig<T>): Promise<ApiResponse<T>> {
    const url = this.buildUrl(path, config?.params);
    return apiFetch<T>(url, {
      method: 'PUT',
      body: body !== undefined ? JSON.stringify(body) : undefined,
      headers: {
        'Content-Type': 'application/json',
        ...(config?.headers as Record<string, string>),
      },
      ...config,
    });
  }

  async patch<T>(path: string, body?: unknown, config?: RequestConfig<T>): Promise<ApiResponse<T>> {
    const url = this.buildUrl(path, config?.params);
    return apiFetch<T>(url, {
      method: 'PATCH',
      body: body !== undefined ? JSON.stringify(body) : undefined,
      headers: {
        'Content-Type': 'application/json',
        ...(config?.headers as Record<string, string>),
      },
      ...config,
    });
  }

  async delete<T>(path: string, config?: RequestConfig<T>): Promise<ApiResponse<T>> {
    const url = this.buildUrl(path, config?.params);
    return apiFetch<T>(url, {
      method: 'DELETE',
      ...config,
    });
  }
}

export const api = new ApiService();
export type { ApiResponse, ErrorClassification };
