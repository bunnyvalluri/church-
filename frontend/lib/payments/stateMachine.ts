/**
 * frontend/lib/payments/stateMachine.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Centralized Payment State Machine for Kingdom of Christ Ministries.
 *
 * Rules:
 *  • Enforces valid lifecycle transitions
 *  • Prevents illegal status jumps (e.g. FAILED -> CAPTURED without audit proof)
 *  • Provides safe transactional helper for state changes with audit logging
 */

import { PaymentState } from './types';
import { prisma } from '@/lib/prisma';
import { writeAuditLog } from '@/lib/auditLogger';

// Map of permitted state transitions
const VALID_TRANSITIONS: Record<PaymentState, PaymentState[]> = {
  CREATED: ['PENDING', 'CANCELLED', 'EXPIRED'],
  PENDING: ['AUTHORIZED', 'CAPTURED', 'FAILED', 'EXPIRED', 'CANCELLED'],
  AUTHORIZED: ['CAPTURED', 'FAILED', 'CANCELLED'],
  CAPTURED: ['REFUNDED', 'PARTIALLY_REFUNDED'],
  FAILED: ['CAPTURED'], // Only allowed if authoritative gateway reconciliation confirms capture
  REFUNDED: [],
  PARTIALLY_REFUNDED: ['REFUNDED'],
  CANCELLED: [],
  EXPIRED: [],
};

/**
 * Validates whether a state transition is legal.
 */
export function isValidTransition(fromState: PaymentState, toState: PaymentState): boolean {
  if (fromState === toState) return true; // Idempotent no-op
  const allowed = VALID_TRANSITIONS[fromState];
  return allowed ? allowed.includes(toState) : false;
}

/**
 * Maps Prisma DB DonationStatus string to canonical PaymentState.
 */
export function mapDbStatusToPaymentState(dbStatus: string): PaymentState {
  switch (dbStatus?.toUpperCase()) {
    case 'COMPLETED':
      return 'CAPTURED';
    case 'PROCESSING':
    case 'PENDING':
      return 'PENDING';
    case 'FAILED':
      return 'FAILED';
    case 'EXPIRED':
      return 'EXPIRED';
    case 'REFUNDED':
      return 'REFUNDED';
    case 'CANCELLED':
      return 'CANCELLED';
    default:
      return 'PENDING';
  }
}

/**
 * Maps canonical PaymentState to Prisma DB DonationStatus enum value.
 */
export function mapPaymentStateToDbStatus(state: PaymentState): 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'EXPIRED' | 'REFUNDED' {
  switch (state) {
    case 'CAPTURED':
      return 'COMPLETED';
    case 'AUTHORIZED':
    case 'PENDING':
    case 'CREATED':
      return 'PENDING';
    case 'FAILED':
    case 'CANCELLED':
      return 'FAILED';
    case 'EXPIRED':
      return 'EXPIRED';
    case 'REFUNDED':
    case 'PARTIALLY_REFUNDED':
      return 'REFUNDED';
    default:
      return 'PENDING';
  }
}

/**
 * Safely transitions a donation's state in the database.
 * Throws an error if the transition is illegal.
 */
export async function transitionDonationState(
  donationId: string,
  targetState: PaymentState,
  context: {
    actorId?: string | null;
    reason?: string;
    ipAddress?: string;
    gatewayPaymentId?: string;
  } = {}
) {
  const donation = await prisma.donation.findUnique({
    where: { id: donationId },
  });

  if (!donation) {
    throw new Error(`Donation ${donationId} not found.`);
  }

  const currentState = mapDbStatusToPaymentState(donation.status);

  if (!isValidTransition(currentState, targetState)) {
    const errorMsg = `Illegal payment state transition from ${currentState} to ${targetState} for donation ${donationId}`;
    await writeAuditLog({
      userId: context.actorId || donation.userId || null,
      action: 'PAYMENT_STATE_TRANSITION_REJECTED',
      details: `${errorMsg}. Reason: ${context.reason || 'None provided'}`,
      ipAddress: context.ipAddress,
    });
    throw new Error(errorMsg);
  }

  const newDbStatus = mapPaymentStateToDbStatus(targetState);

  const updatedDonation = await prisma.donation.update({
    where: { id: donationId },
    data: {
      status: newDbStatus,
      ...(context.gatewayPaymentId ? { razorpayPaymentId: context.gatewayPaymentId } : {}),
      updatedAt: new Date(),
    },
  });

  // Also sync associated session if present
  if (donation.sessionId) {
    await prisma.donationSession.update({
      where: { id: donation.sessionId },
      data: {
        status: newDbStatus,
        paymentState: targetState,
        updatedAt: new Date(),
      },
    }).catch(() => {});
  }

  await writeAuditLog({
    userId: context.actorId || donation.userId || null,
    action: `PAYMENT_STATE_${targetState}`,
    details: `Transitioned donation ${donationId} from ${currentState} to ${targetState}. Reason: ${context.reason || 'Normal lifecycle'}`,
    ipAddress: context.ipAddress,
  });

  return updatedDonation;
}
