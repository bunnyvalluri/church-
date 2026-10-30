/**
 * src/application/dtos/index.ts
 * Application Data Transfer Objects and input contracts.
 */

import { UserRole } from '../../types/auth.types';
import { DonationFund } from '../../domain/donation.entity';
import { PrayerPrivacy } from '../../domain/prayer.entity';
import { MutationPacket } from '../../domain/offlineSync.entity';

export interface LoginDto {
  email: string;
  password?: string;
  googleIdToken?: string;
}

export interface RegisterDto {
  name: string;
  email: string;
  password?: string;
  phone?: string;
  branchId?: string;
  role?: UserRole;
}

export interface CreateDonationOrderDto {
  amountInRupees: number;
  fund: DonationFund;
  donorName: string;
  donorEmail: string;
  donorPhone?: string;
  branchId?: string;
  idempotencyKey: string;
}

export interface VerifyDonationDto {
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
  donationId: string;
}

export interface CreateEventDto {
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  branchId?: string;
  registrationRequired?: boolean;
  registrationLimit?: number;
}

export interface CreatePrayerDto {
  title: string;
  description: string;
  requesterName?: string;
  requesterEmail?: string;
  requesterPhone?: string;
  isAnonymous?: boolean;
  privacy?: PrayerPrivacy;
}

export interface SyncBatchDto {
  deviceId: string;
  mutations: MutationPacket[];
}

