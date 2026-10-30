import { api, ApiResponse } from '../../services/apiClient';

export interface ChurchAnnouncement {
  id: string;
  title: string;
  body: string;
  isUrgent: boolean;
  publishDate: string;
  expiresDate?: string;
  campusId?: string;
}

export class AnnouncementsService {
  static async getActiveAnnouncements(campusId?: string): Promise<ApiResponse<ChurchAnnouncement[]>> {
    return api.get('/api/announcements', { params: { campusId } });
  }
}

