import { api, ApiResponse } from '../../services/apiClient';
import { ChurchEvent, EventRegistrationData } from './schemas';

export class EventsService {
  static async getEvents(params?: {
    page?: number;
    limit?: number;
    campusId?: string;
    category?: string;
  }): Promise<ApiResponse<{ events: ChurchEvent[]; total: number }>> {
    return api.get('/api/events', { params });
  }

  static async getEventBySlug(slug: string): Promise<ApiResponse<ChurchEvent>> {
    return api.get(`/api/events/${slug}`);
  }

  static async registerForEvent(
    data: EventRegistrationData
  ): Promise<ApiResponse<{ ticketId: string; qrCode: string; seatNumbers: string[] }>> {
    return api.post(`/api/events/${data.eventId}/register`, data);
  }

  static async checkInAttendee(
    eventId: string,
    ticketId: string
  ): Promise<ApiResponse<{ success: boolean; checkedInAt: string }>> {
    return api.post(`/api/events/${eventId}/checkin`, { ticketId });
  }
}

