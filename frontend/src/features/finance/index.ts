import { api, ApiResponse } from '../../services/apiClient';

export interface FinanceSummary {
  totalOfferings: number;
  totalTithes: number;
  totalBuildingFund: number;
  totalMissions: number;
  currency: string;
  reconciliationStatus: 'BALANCED' | 'PENDING_REVIEW';
  lastReconciledAt: string;
}

export class FinanceService {
  static async getSummary(params?: { campusId?: string; year?: number }): Promise<ApiResponse<FinanceSummary>> {
    return api.get('/api/finance/summary', { params });
  }

  static async getTransactions(params?: {
    page?: number;
    limit?: number;
    purpose?: string;
  }): Promise<ApiResponse<{ transactions: any[]; total: number }>> {
    return api.get('/api/finance/transactions', { params });
  }
}

