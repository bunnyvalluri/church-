/**
 * POST /api/payments/webhook
 * ─────────────────────────────────────────────────────────────────────────────
 * Authoritative Webhook Entrypoint matching Razorpay Dashboard Configuration:
 *   https://kcmchurch.vercel.app/api/payments/webhook
 *
 * Delegates to the unified production webhook processing pipeline in
 * @/app/api/webhooks/razorpay/route.
 */

import { POST as handleRazorpayWebhook } from '@/app/api/webhooks/razorpay/route';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  return handleRazorpayWebhook(req);
}
