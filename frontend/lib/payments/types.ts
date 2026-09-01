/**
 * frontend/lib/payments/types.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Authoritative Payment Domain Types & Gateway Provider Abstractions for KCM.
 *
 * Enforces:
 *  • Strong typing for monetary amounts in integer paise (minor units)
 *  • Pluggable PaymentProvider interface for multi-gateway expansion (Razorpay, Stripe, UPI)
 *  • Rigid Payment State Machine definitions
 *  • Cryptographic verification contracts
 */

export type PaymentState =
  | 'CREATED'
  | 'PENDING'
  | 'AUTHORIZED'
  | 'CAPTURED'
  | 'FAILED'
  | 'REFUNDED'
  | 'PARTIALLY_REFUNDED'
  | 'CANCELLED'
  | 'EXPIRED';

export type PaymentGatewayType = 'RAZORPAY' | 'STRIPE' | 'UPI_DIRECT' | 'MANUAL';

export interface CreatePaymentOrderInput {
  amountInINR: number;
  purpose: string;
  purposeId?: string;
  referenceNumber: string;
  donorName: string;
  donorEmail?: string | null;
  donorPhone?: string | null;
  panNumber?: string | null;
  isAnonymous?: boolean;
  branchId?: string | null;
  userId?: string | null;
  notes?: Record<string, string>;
}

export interface PaymentOrderResult {
  provider: PaymentGatewayType;
  providerOrderId: string;
  amountInPaise: number;
  amountInINR: number;
  currency: string;
  referenceNumber: string;
  upiUri?: string;
  qrCode?: string;
  expiresAt: Date;
  metadata?: Record<string, unknown>;
  isMock?: boolean;
}

export interface VerifySignatureInput {
  providerOrderId: string;
  providerPaymentId: string;
  providerSignature: string;
}

export interface GatewayPaymentDetails {
  paymentId: string;
  orderId?: string;
  amountInPaise: number;
  currency: string;
  status: 'captured' | 'authorized' | 'failed' | 'refunded' | 'pending';
  method?: string;
  email?: string;
  contact?: string;
  vpa?: string;
  createdAt?: Date;
  errorCode?: string;
  errorDescription?: string;
  rawPayload?: Record<string, unknown>;
}

export interface ProcessRefundInput {
  paymentId: string;
  amountInPaise?: number; // If partial, else full refund
  reason?: string;
  adminUserId: string;
}

export interface RefundResult {
  success: boolean;
  refundId: string;
  amountInPaise: number;
  currency: string;
  status: 'processed' | 'pending' | 'failed';
  rawPayload?: Record<string, unknown>;
}

export interface WebhookVerificationResult {
  isValid: boolean;
  eventType?: string;
  orderId?: string;
  paymentId?: string;
  amountInPaise?: number;
  currency?: string;
  error?: string;
  rawEvent?: Record<string, unknown>;
}

/**
 * Standard Payment Provider interface.
 * Implemented by RazorpayPaymentProvider, StripePaymentProvider, etc.
 */
export interface PaymentProvider {
  readonly providerName: PaymentGatewayType;

  /**
   * Creates a payment order on the remote payment gateway.
   */
  createOrder(input: CreatePaymentOrderInput): Promise<PaymentOrderResult>;

  /**
   * Cryptographically verifies the checkout payment signature.
   */
  verifyPaymentSignature(input: VerifySignatureInput): boolean;

  /**
   * Cryptographically verifies the incoming webhook request signature.
   */
  verifyWebhookSignature(rawBody: string, signature: string | null): boolean;

  /**
   * Fetches the authoritative payment status from the payment gateway API.
   */
  fetchPayment(paymentId: string): Promise<GatewayPaymentDetails | null>;

  /**
   * Issues an authorized refund via the gateway API.
   */
  processRefund?(input: ProcessRefundInput): Promise<RefundResult>;
}

export interface ReconciliationDiscrepancy {
  donationId: string;
  sessionId?: string | null;
  providerOrderId?: string | null;
  providerPaymentId?: string | null;
  dbStatus: string;
  gatewayStatus: string;
  dbAmount: number;
  gatewayAmountPaise?: number;
  discrepancyType:
    | 'GATEWAY_PAID_DB_PENDING'
    | 'GATEWAY_FAILED_DB_COMPLETED'
    | 'AMOUNT_MISMATCH'
    | 'MISSING_GATEWAY_RECORD'
    | 'REFUND_MISMATCH';
  suggestedAction: string;
}
