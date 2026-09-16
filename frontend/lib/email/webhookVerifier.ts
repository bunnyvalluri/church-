import crypto from 'crypto';
import { logger } from '@/lib/logger';

/**
 * Verifies standard Svix / Resend webhook signature.
 * Prevents replay attacks using 5-minute timestamp window.
 */
export function verifyResendWebhookSignature(
  rawBody: string,
  headers: { id?: string | null; timestamp?: string | null; signature?: string | null },
  secret: string
): boolean {
  if (!secret || !headers.id || !headers.timestamp || !headers.signature) {
    return false;
  }

  // 1. Replay window check: reject events older than 5 minutes
  const now = Math.floor(Date.now() / 1000);
  const ts = parseInt(headers.timestamp, 10);
  if (isNaN(ts) || Math.abs(now - ts) > 300) {
    return false;
  }

  try {
    const toSign = `${headers.id}.${headers.timestamp}.${rawBody}`;
    const cleanSecret = secret.startsWith('whsec_') ? secret.slice(6) : secret;
    const keyBytes = Buffer.from(cleanSecret, 'base64');

    const expectedSig = crypto
      .createHmac('sha256', keyBytes)
      .update(toSign)
      .digest('base64');

    const signatures = headers.signature.split(' ');
    for (const entry of signatures) {
      const parts = entry.split(',');
      if (parts.length === 2 && parts[0] === 'v1') {
        const signatureVal = parts[1];
        if (
          signatureVal.length === expectedSig.length &&
          crypto.timingSafeEqual(Buffer.from(signatureVal), Buffer.from(expectedSig))
        ) {
          return true;
        }
      }
    }
  } catch (err: any) {
    logger.error('[WEBHOOK/RESEND] Error computing HMAC signature:', { error: err.message });
    return false;
  }

  return false;
}
