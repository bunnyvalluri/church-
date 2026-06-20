import { NextResponse } from 'next/server';

// ── Standard success response ────────────────────────────────────────────────
export function ok<T>(data: T, status = 200) {
  return NextResponse.json({ success: true, data }, { status });
}

// ── Standard error response ──────────────────────────────────────────────────
export function err(message: string, status = 500, details?: unknown) {
  return NextResponse.json(
    { success: false, error: message, ...(details ? { details } : {}) },
    { status }
  );
}

// ── Extracts real client IP, handles proxies and Vercel edge ─────────────────
export function getClientIp(req: Request): string {
  const forwardedFor = req.headers.get('x-forwarded-for');
  if (forwardedFor) {
    // x-forwarded-for can be a comma-separated list — first is the real client
    return forwardedFor.split(',')[0].trim();
  }
  return (
    req.headers.get('x-real-ip') ||
    req.headers.get('cf-connecting-ip') || // Cloudflare
    'unknown'
  );
}

// ── Safely parses JSON body; returns null on any failure ────────────────────
export async function safeJson<T>(req: Request): Promise<T | null> {
  try {
    const contentType = req.headers.get('content-type') ?? '';
    if (!contentType.includes('application/json')) return null;
    return (await req.json()) as T;
  } catch {
    return null;
  }
}

// ── Build a standard paginated response ──────────────────────────────────────
export function paginated<T>(
  data: T[],
  total: number,
  page: number,
  pageSize: number
) {
  return NextResponse.json({
    success: true,
    data,
    meta: {
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    },
  });
}
