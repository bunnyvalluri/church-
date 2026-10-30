/**
 * src/infrastructure/razorpay/client.ts
 * Razorpay Payment Gateway integration with HMAC-SHA256 signature verification.
 */

import crypto from 'crypto';
import { servicesConfig } from '../../config/services';
import { BadRequestError } from '../../shared/errors';
import { safeCompareStrings } from '../../shared/utils';

export interface CreateOrderParams {
  amountInRupees: number;
  receipt: string;
  notes?: Record<string, string>;
}

export class RazorpayClient {
  public static verifyPaymentSignature(
    orderId: string,
    paymentId: string,
    signature: string
  ): boolean {
    const keySecret = servicesConfig.razorpay.keySecret;
    if (!keySecret) return false;

    const payload = `${orderId}|${paymentId}`;
    const expectedSignature = crypto
      .createHmac('sha256', keySecret)
      .update(payload)
      .digest('hex');

    return safeCompareStrings(expectedSignature, signature);
  }

  public static verifyWebhookSignature(rawBody: string, signature: string): boolean {
    const webhookSecret = servicesConfig.razorpay.webhookSecret;
    if (!webhookSecret) return false;

    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(rawBody)
      .digest('hex');

    return safeCompareStrings(expectedSignature, signature);
  }

  public static async createOrder(params: CreateOrderParams): Promise<{
    id: string;
    amount: number;
    currency: string;
    receipt: string;
  }> {
    const { keyId, keySecret, currency } = servicesConfig.razorpay;
    if (!keyId || !keySecret) {
      // In offline/test mode, simulate a valid order
      return {
        id: `order_mock_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
        amount: Math.round(params.amountInRupees * 100),
        currency: currency || 'INR',
        receipt: params.receipt,
      };
    }

    const amountInPaise = Math.round(params.amountInRupees * 100);
    const authHeader = `Basic ${Buffer.from(`${keyId}:${keySecret}`).toString('base64')}`;

    const res = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: authHeader,
      },
      body: JSON.stringify({
        amount: amountInPaise,
        currency: currency || 'INR',
        receipt: params.receipt,
        notes: params.notes || {},
      }),
    });

    if (!res.ok) {
      const err = (await res.json().catch(() => ({}))) as any;
      throw new BadRequestError(`Razorpay order creation failed: ${err?.error?.description || res.statusText}`);
    }

    const data = (await res.json()) as any;
    return {
      id: data.id,
      amount: data.amount,
      currency: data.currency,
      receipt: data.receipt,
    };
  }
}
