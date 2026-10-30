import { api, ApiResponse } from '../../services/apiClient';

export interface SmallGroup {
  id: string;
  name: string;
  campusId: string;
  leaderName: string;
  meetingTime: string;
  meetingLocation: string;
  membersCount: number;
}

export class GroupsService {
  static async getGroups(campusId?: string): Promise<ApiResponse<SmallGroup[]>> {
    return api.get('/api/groups', { params: { campusId } });
  }

  static async joinGroup(groupId: string): Promise<ApiResponse<{ status: string }>> {
    return api.post(`/api/groups/${groupId}/join`);
  }
}

