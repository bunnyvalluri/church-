import { api, ApiResponse } from '../../services/apiClient';

export interface NGOProject {
  id: string;
  title: string;
  category: 'FEEDING' | 'EDUCATION' | 'MEDICAL' | 'ORPHAN_CARE' | 'WOMEN_EMPOWERMENT';
  description: string;
  targetAmount: number;
  raisedAmount: number;
  beneficiariesCount: number;
  imageUrl: string;
  status: 'ACTIVE' | 'COMPLETED';
}

export class NGOService {
  static async getProjects(): Promise<ApiResponse<NGOProject[]>> {
    return api.get('/api/ngo/projects');
  }

  static async getOutreachStats(): Promise<
    ApiResponse<{
      mealsServed: number;
      studentsEducated: number;
      familiesSupported: number;
      medicalCampsConducted: number;
    }>
  > {
    return api.get('/api/ngo/stats');
  }
}

