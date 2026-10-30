import { z } from 'zod';

export const donationPurposeEnum = z.enum([
  'TITHE',
  'OFFERING',
  'BUILDING_FUND',
  'MISSIONS',
  'COMMUNITY_CARE',
  'GENERAL',
]);

export type DonationPurpose = z.infer<typeof donationPurposeEnum>;

export interface DonationRecord {
  id: string;
  amount: number;
  currency: string;
  purpose: DonationPurpose;
  donorName: string;
  donorEmail: string;
  donorPhone?: string;
  panNumber?: string;
  status: 'INITIATED' | 'COMPLETED' | 'FAILED' | 'REFUNDED';
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  createdAt: string;
  taxExemptEligible?: boolean;
}

export const donationFormSchema = z.object({
  amount: z.number().min(10, 'Minimum donation amount is ₹10'),
  purpose: donationPurposeEnum.default('TITHE'),
  donorName: z.string().min(2, 'Name is required'),
  donorEmail: z.string().email('Valid email required for 80G tax receipt'),
  donorPhone: z.string().regex(/^\+?[0-9]{10,14}$/, 'Valid phone required for SMS receipt'),
  panNumber: z.string().regex(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, 'Invalid Indian PAN number format').optional().or(z.literal('')),
  idempotencyKey: z.string().min(1),
});

export type DonationFormData = z.infer<typeof donationFormSchema>;

