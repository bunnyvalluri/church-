import { api, ApiResponse } from '../../services/apiClient';

export interface ChurchNotification {
  id: string;
  title: string;
  message: string;
  type: 'EVENT' | 'PRAYER' | 'DONATION' | 'BROADCAST';
  read: boolean;
  createdAt: string;
  actionUrl?: string;
}

export class NotificationsService {
  static async getNotifications(): Promise<ApiResponse<ChurchNotification[]>> {
    return api.get('/api/notifications');
  }

  static async markAsRead(id: string): Promise<ApiResponse<{ success: boolean }>> {
    return api.post(`/api/notifications/${id}/read`);
  }

  static async registerFCMToken(token: string): Promise<ApiResponse<{ registered: boolean }>> {
    return api.post('/api/notifications/fcm-token', { token });
  }
}

