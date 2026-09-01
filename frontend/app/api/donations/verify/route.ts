/**
 * POST /api/donations/verify
 * ─────────────────────────────────────────────────────────────────────────────
 * Delegates to the unified cryptographic payment verification handler.
 */

import { POST as handlePaymentVerify } from '@/app/api/payments/verify/route';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  return handlePaymentVerify(req);
}
