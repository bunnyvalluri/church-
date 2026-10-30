import { api, ApiResponse } from '../../services/apiClient';

export interface AttendanceRecord {
  id: string;
  memberId: string;
  memberName: string;
  eventId: string;
  eventTitle: string;
  campusId: string;
  attendedAt: string;
  checkInMethod: 'QR_SCAN' | 'MANUAL' | 'BIOMETRIC';
}

export class AttendanceService {
  static async checkInByQR(payload: {
    ticketId: string;
    campusId: string;
  }): Promise<ApiResponse<{ success: boolean; memberName: string; attendedAt: string }>> {
    return api.post('/api/attendance/check-in', payload);
  }

  static async getAttendanceStats(params?: {
    eventId?: string;
    campusId?: string;
  }): Promise<ApiResponse<{ totalAttended: number; checkInRate: number; breakdown: any[] }>> {
    return api.get('/api/attendance/stats', { params });
  }
}

