import { api, ApiResponse } from '../../services/apiClient';

export interface ChurchMember {
  id: string;
  name: string;
  email: string;
  phone: string;
  campusId: string;
  role: string;
  joinDate: string;
  baptismStatus: boolean;
  smallGroupId?: string;
  avatarUrl?: string;
}

export class MembersService {
  static async getMembers(params?: {
    page?: number;
    limit?: number;
    campusId?: string;
    search?: string;
  }): Promise<ApiResponse<{ members: ChurchMember[]; total: number }>> {
    return api.get('/api/members', { params });
  }

  static async getMemberProfile(id: string): Promise<ApiResponse<ChurchMember>> {
    return api.get(`/api/members/${id}`);
  }

  static async updateProfile(id: string, data: Partial<ChurchMember>): Promise<ApiResponse<ChurchMember>> {
    return api.patch(`/api/members/${id}`, data);
  }
}

