/**
 * src/domain/donation.entity.ts
 * Domain model and financial invariants for KCM Offerings, Tithes & NGO Giving.
 */

import { BadRequestError } from '../shared/errors';

export type PaymentStatus = 'PENDING' | 'SUCCESS' | 'FAILED' | 'REFUNDED';
export type DonationFund = 'TITHE' | 'OFFERING' | 'BUILDING_FUND' | 'MISSIONS' | 'NGO_FEEDING' | 'CHARITY';

export class DonationEntity {
  constructor(
    public readonly id: string,
    public readonly userId: string | null,
    public readonly donorName: string,
    public readonly donorEmail: string,
    public readonly donorPhone: string | null,
    public readonly amount: number,
    public readonly currency: string,
    public readonly fund: DonationFund,
    public readonly branchId: string | null,
    public readonly paymentGateway: 'RAZORPAY' | 'STRIPE' | 'CASH' | 'OFFLINE',
    public readonly gatewayOrderId: string | null,
    public readonly gatewayPaymentId: string | null,
    public readonly status: PaymentStatus,
    public readonly idempotencyKey: string,
    public readonly createdAt: Date = new Date()
  ) {
    this.validate();
  }

  private validate(): void {
    if (this.amount <= 0 || isNaN(this.amount)) {
      throw new BadRequestError('Donation amount must be greater than zero.');
    }
    if (!this.idempotencyKey) {
      throw new BadRequestError('Idempotency key is required to prevent double-charging.');
    }
  }

  public isSuccessful(): boolean {
    return this.status === 'SUCCESS';
  }
}

