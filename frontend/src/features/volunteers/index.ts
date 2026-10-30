import { api, ApiResponse } from '../../services/apiClient';

export interface VolunteerDepartment {
  id: string;
  name: string;
  description: string;
  leaderName: string;
  campusId: string;
  openPositionsCount: number;
}

export class VolunteersService {
  static async getDepartments(): Promise<ApiResponse<VolunteerDepartment[]>> {
    return api.get('/api/volunteers/departments');
  }

  static async applyForRole(payload: {
    departmentId: string;
    notes?: string;
    availability: string[];
  }): Promise<ApiResponse<{ applicationRef: string; status: string }>> {
    return api.post('/api/volunteers/apply', payload);
  }
}

