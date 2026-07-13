import crypto from 'crypto';
import { z } from 'zod';

/**
 * Verifies the payment provider's webhook signature.
 * Computes the HMAC-SHA256 signature of the raw string payload using the configured secret
 * and compares it in a timing-safe manner against the signature header.
 */
export function verifyWebhookSignature(
  rawBody: string,
  signatureHeader: string | null | undefined,
  webhookSecret: string
): boolean {
  if (!signatureHeader) return false;

  try {
    const computedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(rawBody)
      .digest('hex');

    // Prevent timing attacks using timingSafeEqual
    const a = Buffer.from(computedSignature, 'utf8');
    const b = Buffer.from(signatureHeader, 'utf8');

    if (a.length !== b.length) {
      return false;
    }

    return crypto.timingSafeEqual(a, b);
  } catch (err) {
    console.error('[SECURITY] Webhook signature verification error:', err);
    return false;
  }
}

/**
 * Sanitizes a string input by removing potential HTML tags and script elements
 * to prevent Cross-Site Scripting (XSS) attacks.
 */
export function sanitizeInput(input: string): string {
  if (!input) return '';
  return input
    .replace(/<[^>]*>/g, '') // strip HTML tags
    .replace(/[&<>"']/g, (char) => {
      switch (char) {
        case '&': return '&amp;';
        case '<': return '&lt;';
        case '>': return '&gt;';
        case '"': return '&quot;';
        case "'": return '&#x27;';
        default: return char;
      }
    })
    .trim();
}

/**
 * Donation Session Creation Zod Validation Schema
 */
export const DonationSessionSchema = z.object({
  amount: z.number().positive('Donation amount must be greater than zero'),
  purposeCode: z.string().min(1, 'Donation purpose code is required'),
  branchId: z.string().optional().nullable(),
  donorName: z.string().min(2, 'Name must be at least 2 characters').max(100),
  donorEmail: z.string().email('Invalid email address'),
  donorPhone: z.string().regex(/^\+?[0-9]{10,15}$/, 'Invalid phone number format'),
});

/**
 * Webhook Verification Schema
 */
export const WebhookPayloadSchema = z.object({
  event: z.string(),
  paymentId: z.string(),
  sessionId: z.string(),
  amount: z.number(),
  currency: z.string().default('INR'),
  signature: z.string(),
  utr: z.string(), // UPI transaction reference
  timestamp: z.number(),
});
