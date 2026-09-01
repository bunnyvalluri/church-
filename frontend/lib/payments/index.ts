/**
 * frontend/lib/payments/index.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Central exports and provider factory for KCM Payment Architecture.
 */

import { PaymentProvider, PaymentGatewayType } from './types';
import { RazorpayPaymentProvider } from './razorpayProvider';

export * from './types';
export * from './stateMachine';
export * from './razorpayProvider';

let defaultRazorpayProvider: RazorpayPaymentProvider | null = null;

/**
 * Factory function to retrieve the active Payment Provider.
 * Allows effortless addition of Stripe or secondary gateways.
 */
export function getPaymentProvider(type: PaymentGatewayType = 'RAZORPAY'): PaymentProvider {
  switch (type) {
    case 'RAZORPAY':
    default:
      if (!defaultRazorpayProvider) {
        defaultRazorpayProvider = new RazorpayPaymentProvider();
      }
      return defaultRazorpayProvider;
  }
}
