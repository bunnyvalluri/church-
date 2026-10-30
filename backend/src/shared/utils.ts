/**
 * src/shared/utils.ts
 * Enterprise utility helpers for security, formatting, and pagination.
 */

import crypto from 'crypto';
import { QueryPaginationOptions, PaginatedResult } from '../types/common.types';

export function hashString(input: string): string {
  return crypto.createHash('sha256').update(input).digest('hex');
}

export function generateRandomToken(bytes = 32): string {
  return crypto.randomBytes(bytes).toString('hex');
}

export function maskPhoneNumber(phone?: string | null): string {
  if (!phone) return '';
  const clean = phone.replace(/\D/g, '');
  if (clean.length < 6) return '****';
  return `${clean.slice(0, 3)}****${clean.slice(-3)}`;
}

export function normalizePhoneNumber(phone: string, defaultCountryCode = '+91'): string {
  const clean = phone.replace(/[\s\-\(\)\.]/g, '');
  if (clean.startsWith('+')) return clean;
  if (clean.startsWith('0') && clean.length === 11) {
    return `${defaultCountryCode}${clean.slice(1)}`;
  }
  if (clean.length === 10) {
    return `${defaultCountryCode}${clean}`;
  }
  return clean;
}

export function getPaginationParams(query: QueryPaginationOptions): {
  page: number;
  limit: number;
  skip: number;
} {
  const page = Math.max(1, Number(query.page) || 1);
  const limit = Math.min(100, Math.max(1, Number(query.limit) || 20));
  const skip = (page - 1) * limit;
  return { page, limit, skip };
}

export function createPaginatedResponse<T>(
  items: T[],
  total: number,
  page: number,
  limit: number
): PaginatedResult<T> {
  return {
    items,
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit) || 1,
  };
}

export function safeCompareStrings(a: string, b: string): boolean {
  try {
    const bufA = Buffer.from(a);
    const bufB = Buffer.from(b);
    if (bufA.length !== bufB.length) return false;
    return crypto.timingSafeEqual(bufA, bufB);
  } catch {
    return false;
  }
}

