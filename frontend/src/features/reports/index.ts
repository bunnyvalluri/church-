import { api, ApiResponse } from '../../services/apiClient';

export interface ReportMetrics {
  totalActiveMembers: number;
  averageWeeklyAttendance: number;
  monthlyOfferingsTotal: number;
  newConvertsCount: number;
  reportingPeriod: string;
}

export class ReportsService {
  static async getExecutiveMetrics(params?: { campusId?: string; year?: number }): Promise<ApiResponse<ReportMetrics>> {
    return api.get('/api/reports/metrics', { params });
  }
}

