/**
 * frontend/lib/payments/razorpayProvider.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Official Razorpay Payment Provider Implementation for KCM.
 *
 * Implements the PaymentProvider abstraction using the official Razorpay SDK,
 * Node.js crypto for constant-time HMAC-SHA256 signature verification, and
 * integer paise arithmetic for all financial operations.
 */

import crypto from 'crypto';
import Razorpay from 'razorpay';
import QRCode from 'qrcode';
import {
  PaymentProvider,
  CreatePaymentOrderInput,
  PaymentOrderResult,
  VerifySignatureInput,
  GatewayPaymentDetails,
  ProcessRefundInput,
  RefundResult,
} from './types';
import { prisma } from '@/lib/prisma';

export class RazorpayPaymentProvider implements PaymentProvider {
  readonly providerName = 'RAZORPAY' as const;

  private keyId: string;
  private keySecret: string;
  private webhookSecret: string;
  private razorpayClient: Razorpay | null = null;

  constructor() {
    this.keyId = process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || '';
    this.keySecret = process.env.RAZORPAY_KEY_SECRET || '';
    this.webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || '';

    if (this.hasLiveCredentials()) {
      this.razorpayClient = new Razorpay({
        key_id: this.keyId,
        key_secret: this.keySecret,
      });
    }
  }

  public hasLiveCredentials(): boolean {
    return (
      Boolean(this.keyId) &&
      !this.keyId.startsWith('rzp_test_default') &&
      Boolean(this.keySecret) &&
      !this.keySecret.startsWith('mock_razorpay')
    );
  }

  /**
   * Create an authoritative order on Razorpay.
   */
  async createOrder(input: CreatePaymentOrderInput): Promise<PaymentOrderResult> {
    const amountInPaise = Math.round(input.amountInINR * 100);

    if (amountInPaise <= 0 || isNaN(amountInPaise) || !Number.isInteger(amountInPaise)) {
      throw new Error(`Invalid payment amount: ₹${input.amountInINR}`);
    }

    // Load dynamic church settings for QR & UPI details
    const settings = await prisma.churchSettings.findUnique({
      where: { id: 'settings' },
    }).catch(() => null);

    const upiId = settings?.upiId || process.env.NEXT_PUBLIC_UPI_ID || 'kcm.kristhraj2004-1@okicici';
    const merchantName = settings?.merchantName || process.env.NEXT_PUBLIC_CHURCH_NAME || 'Kingdom of Christ Ministries';
    const expiryMins = settings?.qrExpiryMinutes || 15;
    const expiresAt = new Date(Date.now() + expiryMins * 60 * 1000);

    let providerOrderId: string;
    let isMock = false;

    if (this.razorpayClient) {
      try {
        const order = await this.razorpayClient.orders.create({
          amount: amountInPaise,
          currency: 'INR',
          receipt: input.referenceNumber,
          notes: {
            purpose: input.purpose,
            donorName: input.isAnonymous ? 'Anonymous Donor' : input.donorName,
            hasPan: input.panNumber ? 'YES' : 'NO',
            source: 'KCM_PORTAL',
            ...(input.notes || {}),
          },
        });
        providerOrderId = order.id;
      } catch (err: any) {
        console.error('[RAZORPAY_PROVIDER] Order creation failed:', err?.description || err?.message || err);
        throw new Error(err?.description || 'Failed to create payment order on Razorpay.');
      }
    } else {
      if (process.env.NODE_ENV === 'production') {
        throw new Error('Razorpay production API credentials are not configured on the server.');
      }
      isMock = true;
      providerOrderId = `order_${crypto.randomUUID().replace(/-/g, '').slice(0, 14)}`;
      console.info('[RAZORPAY_PROVIDER] Non-production test order created:', providerOrderId);
    }

    // Generate dynamic UPI URI and QR code
    const encodedName = encodeURIComponent(merchantName);
    const txNote = `KCM Donation ${input.referenceNumber}`;
    const encodedNote = encodeURIComponent(txNote);

    const upiUri =
      `upi://pay?pa=${upiId}&pn=${encodedName}` +
      `&am=${input.amountInINR.toFixed(2)}&cu=INR` +
      `&tn=${encodedNote}&tr=${input.referenceNumber}`;

    const qrCode = await QRCode.toDataURL(upiUri, {
      margin: 2,
      width: 360,
      errorCorrectionLevel: 'H',
      color: { dark: '#4F1C91', light: '#FFFFFF' },
    });

    return {
      provider: 'RAZORPAY',
      providerOrderId,
      amountInPaise,
      amountInINR: input.amountInINR,
      currency: 'INR',
      referenceNumber: input.referenceNumber,
      upiUri,
      qrCode,
      expiresAt,
      isMock,
      metadata: {
        upiId,
        merchantName,
      },
    };
  }

  /**
   * Cryptographically verify checkout payment signature using HMAC-SHA256 with constant-time equality.
   */
  verifyPaymentSignature(input: VerifySignatureInput): boolean {
    const { providerOrderId, providerPaymentId, providerSignature } = input;

    if (!providerOrderId || !providerPaymentId || !providerSignature) {
      return false;
    }

    if (!this.keySecret) {
      if (process.env.NODE_ENV !== 'production') {
        return providerSignature.startsWith('dev_sim_') || providerSignature.startsWith('mock_');
      }
      return false;
    }

    try {
      const generatedSignature = crypto
        .createHmac('sha256', this.keySecret)
        .update(`${providerOrderId}|${providerPaymentId}`)
        .digest('hex');

      const expectedBuf = Buffer.from(generatedSignature, 'hex');
      const receivedBuf = Buffer.from(providerSignature, 'hex');

      if (expectedBuf.length !== receivedBuf.length) {
        return false;
      }

      return crypto.timingSafeEqual(expectedBuf, receivedBuf);
    } catch (err) {
      console.error('[RAZORPAY_PROVIDER] Signature verification error:', err);
      return false;
    }
  }

  /**
   * Cryptographically verify raw webhook body against X-Razorpay-Signature header.
   */
  verifyWebhookSignature(rawBody: string, signature: string | null): boolean {
    if (!rawBody || !signature) {
      return false;
    }

    const secret = this.webhookSecret || this.keySecret;
    if (!secret) {
      console.warn('[RAZORPAY_PROVIDER] Webhook secret not configured.');
      return false;
    }

    try {
      const expectedSignature = crypto
        .createHmac('sha256', secret)
        .update(rawBody)
        .digest('hex');

      const expectedBuf = Buffer.from(expectedSignature, 'utf8');
      const receivedBuf = Buffer.from(signature, 'utf8');

      if (expectedBuf.length !== receivedBuf.length) {
        return false;
      }

      return crypto.timingSafeEqual(expectedBuf, receivedBuf);
    } catch (err) {
      console.error('[RAZORPAY_PROVIDER] Webhook signature verification error:', err);
      return false;
    }
  }

  /**
   * Authoritative query to fetch payment state directly from Razorpay Payments API.
   */
  async fetchPayment(paymentId: string): Promise<GatewayPaymentDetails | null> {
    if (!this.razorpayClient || !paymentId) {
      return null;
    }

    try {
      const payment = await this.razorpayClient.payments.fetch(paymentId);
      if (!payment) return null;

      let normalizedStatus: GatewayPaymentDetails['status'] = 'pending';
      if (payment.status === 'captured') normalizedStatus = 'captured';
      else if (payment.status === 'authorized') normalizedStatus = 'authorized';
      else if (payment.status === 'failed') normalizedStatus = 'failed';
      else if (payment.status === 'refunded') normalizedStatus = 'refunded';

      return {
        paymentId: payment.id,
        orderId: payment.order_id || undefined,
        amountInPaise: Number(payment.amount),
        currency: payment.currency || 'INR',
        status: normalizedStatus,
        method: payment.method,
        email: payment.email,
        contact: payment.contact ? String(payment.contact) : undefined,
        vpa: (payment as any).vpa,
        createdAt: payment.created_at ? new Date(payment.created_at * 1000) : undefined,
        errorCode: payment.error_code || undefined,
        errorDescription: payment.error_description || undefined,
        rawPayload: payment as unknown as Record<string, unknown>,
      };
    } catch (err: any) {
      console.warn(`[RAZORPAY_PROVIDER] Could not fetch payment ${paymentId}:`, err?.message || err);
      return null;
    }
  }

  /**
   * Issue a server-side verified refund.
   */
  async processRefund(input: ProcessRefundInput): Promise<RefundResult> {
    if (!this.razorpayClient) {
      throw new Error('Razorpay client not configured for processing refunds.');
    }

    try {
      const refundPayload: Record<string, unknown> = {
        notes: {
          reason: input.reason || 'Admin Authorized Refund',
          adminUserId: input.adminUserId,
        },
      };

      if (input.amountInPaise) {
        refundPayload.amount = input.amountInPaise;
      }

      const refund = await (this.razorpayClient.payments as any).refund(input.paymentId, refundPayload);

      return {
        success: true,
        refundId: refund.id,
        amountInPaise: Number(refund.amount),
        currency: refund.currency || 'INR',
        status: refund.status === 'processed' ? 'processed' : 'pending',
        rawPayload: refund,
      };
    } catch (err: any) {
      console.error('[RAZORPAY_PROVIDER] Refund failed:', err?.description || err?.message || err);
      throw new Error(err?.description || err?.message || 'Gateway refund execution failed.');
    }
  }
}
