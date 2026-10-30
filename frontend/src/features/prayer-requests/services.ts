import { z } from 'zod';
import { api, ApiResponse } from '../../services/apiClient';

export interface PrayerRequest {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  category: 'HEALING' | 'FAMILY' | 'FINANCE' | 'DELIVERANCE' | 'THANKSGIVING' | 'SALVATION' | 'OTHER';
  request: string;
  isConfidential: boolean;
  status: 'PENDING' | 'PRAYING' | 'ANSWERED';
  assignedPastor?: string;
  createdAt: string;
}

export const prayerRequestSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  phone: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
  category: z.enum(['HEALING', 'FAMILY', 'FINANCE', 'DELIVERANCE', 'THANKSGIVING', 'SALVATION', 'OTHER']),
  request: z.string().min(10, 'Please describe your prayer request (at least 10 characters)'),
  isConfidential: z.boolean().default(false),
});

export type PrayerRequestFormData = z.infer<typeof prayerRequestSchema>;

export class PrayerService {
  static async submitRequest(data: PrayerRequestFormData): Promise<ApiResponse<{ id: string; status: string }>> {
    return api.post('/api/prayers', data);
  }

  static async getPublicWall(params?: {
    page?: number;
    limit?: number;
  }): Promise<ApiResponse<{ requests: PrayerRequest[]; total: number }>> {
    return api.get('/api/prayers/wall', { params });
  }

  static async recordPrayerClick(prayerId: string): Promise<ApiResponse<{ prayerCount: number }>> {
    return api.post(`/api/prayers/${prayerId}/pray`);
  }
}

