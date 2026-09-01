/**
 * GET /api/payments/status/[id]
 * ─────────────────────────────────────────────────────────────────────────────
 * Authoritative Payment Status Query Endpoint by ID or Reference Number.
 */

import { NextResponse } from 'next/server';
import { GET as handleStatusQuery } from '@/app/api/payments/[id]/status/route';

export const dynamic = 'force-dynamic';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  return handleStatusQuery(req, { params });
}
