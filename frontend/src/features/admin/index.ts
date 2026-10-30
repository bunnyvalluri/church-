import { api, ApiResponse } from '../../services/apiClient';

export interface SystemDiagnosticStatus {
  database: 'ONLINE' | 'OFFLINE';
  redis: 'ONLINE' | 'OFFLINE' | 'DEGRADED';
  mongodb: 'ONLINE' | 'OFFLINE';
  activeWorkers: number;
  uptimeSeconds: number;
}

export class AdminService {
  static async getSystemDiagnostics(): Promise<ApiResponse<SystemDiagnosticStatus>> {
    return api.get('/api/admin/diagnostics');
  }

  static async getAuditLogs(params?: {
    page?: number;
    limit?: number;
    action?: string;
  }): Promise<ApiResponse<{ logs: any[]; total: number }>> {
    return api.get('/api/admin/audit-logs', { params });
  }

  static async updateUserRole(userId: string, role: string): Promise<ApiResponse<{ success: boolean }>> {
    return api.post(`/api/admin/users/${userId}/role`, { role });
  }
}

