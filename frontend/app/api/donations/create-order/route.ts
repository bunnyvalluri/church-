/**
 * POST /api/donations/create-order
 * ─────────────────────────────────────────────────────────────────────────────
 * Official NGO & Public Donation Order Creation Endpoint for KCM Platform.
 *
 * Delegates to the unified PaymentProvider architecture.
 */

import { NextResponse } from 'next/server';
import { POST as handlePaymentOrderCreate } from '@/app/api/payments/create-order/route';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  return handlePaymentOrderCreate(req);
}
