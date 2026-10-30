/**
 * src/modules/donations/donations.service.ts
 * Church donation, tithe, and offering processing with Razorpay and Idempotency enforcement.
 */

import { prisma } from '../../infrastructure/prisma/client';
import { env } from '../../config/env';
import { RazorpayClient } from '../../infrastructure/razorpay/client';
import { eventPublisher } from '../../application/services/eventPublisher';
import { CreateDonationOrderDto, VerifyDonationDto } from '../../application/dtos';
import { BadRequestError } from '../../shared/errors';

export class DonationsService {
  public async createOrder(dto: CreateDonationOrderDto, userId?: string | null) {
    if (!dto.amountInRupees || dto.amountInRupees <= 0) {
      throw new BadRequestError('Donation amount must be greater than zero.');
    }
    if (!dto.idempotencyKey) {
      throw new BadRequestError('Idempotency key is required.');
    }

    // Check if donation with idempotency key already exists to prevent double billing
    if (!env.DB_OFFLINE) {
      const existing = await prisma.donation.findFirst({
        where: { id: dto.idempotencyKey },
      });
      if (existing) {
        return {
          orderId: existing.razorpayOrderId || dto.idempotencyKey,
          donationId: existing.id,
          amount: existing.amount,
          currency: existing.currency,
        };
      }
    }

    const receipt = `rcpt_${Date.now()}`;
    const order = await RazorpayClient.createOrder({
      amountInRupees: dto.amountInRupees,
      receipt,
      notes: { fund: dto.fund, donorEmail: dto.donorEmail },
    });

    let donationRecord: any = null;
    if (!env.DB_OFFLINE) {
      donationRecord = await prisma.donation.create({
        data: {
          id: dto.idempotencyKey,
          amount: dto.amountInRupees,
          currency: 'INR',
          purpose: dto.fund || 'GENERAL',
          paymentMethod: 'RAZORPAY',
          status: 'PENDING',
          razorpayOrderId: order.id,
          donorName: dto.donorName,
          donorEmail: dto.donorEmail,
          userId: userId || null,
        },
      });
    }

    return {
      orderId: order.id,
      donationId: donationRecord?.id || dto.idempotencyKey,
      amount: order.amount,
      currency: order.currency,
    };
  }

  public async verifyDonation(dto: VerifyDonationDto) {
    const isValid = RazorpayClient.verifyPaymentSignature(
      dto.razorpayOrderId,
      dto.razorpayPaymentId,
      dto.razorpaySignature
    );

    if (!isValid) {
      throw new BadRequestError('Invalid Razorpay cryptographic payment signature.');
    }

    if (!env.DB_OFFLINE) {
      await prisma.donation.update({
        where: { id: dto.donationId },
        data: {
          status: 'COMPLETED',
          razorpayPaymentId: dto.razorpayPaymentId,
        },
      });
    }

    // Notify finance / donor in real-time
    await eventPublisher.publishRealtime(
      'donation:successful',
      { donationId: dto.donationId, paymentId: dto.razorpayPaymentId },
      'finance'
    );

    return { verified: true, paymentId: dto.razorpayPaymentId };
  }
}

export const donationsService = new DonationsService();
