import { api, ApiResponse } from '../../services/apiClient';
import { DonationRecord, DonationFormData } from './schemas';

export class DonationsService {
  static async createOrder(data: DonationFormData): Promise<
    ApiResponse<{
      orderId: string;
      amount: number;
      currency: string;
      keyId: string;
      donationId: string;
    }>
  > {
    return api.post('/api/donations/create-order', data);
  }

  static async verifyPayment(payload: {
    razorpayOrderId: string;
    razorpayPaymentId: string;
    razorpaySignature: string;
    donationId: string;
  }): Promise<ApiResponse<{ verified: boolean; receiptNumber: string }>> {
    return api.post('/api/donations/verify', payload);
  }

  static async getMemberDonations(params?: {
    page?: number;
    limit?: number;
  }): Promise<ApiResponse<{ donations: DonationRecord[]; total: number }>> {
    return api.get('/api/donations/my-giving', { params });
  }

  static async getReceipt(donationId: string): Promise<ApiResponse<{ receiptUrl: string; html: string }>> {
    return api.get(`/api/donations/${donationId}/receipt`);
  }
}

