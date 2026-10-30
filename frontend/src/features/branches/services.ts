import { api, ApiResponse } from '../../services/apiClient';

export interface ChurchBranch {
  id: string;
  name: string;
  slug: string;
  address: string;
  pastorName: string;
  phone: string;
  serviceTimes: string[];
  mapCoordinates: { lat: number; lng: number };
}

export const HYDERABAD_CAMPUSES: ChurchBranch[] = [
  {
    id: 'branch_kukatpally',
    name: 'KCM Kukatpally Campus',
    slug: 'kukatpally',
    address: '15-201, Vivekananda Nagar, Srinivas Nagar, Jeedimetla, Hyderabad, 500055',
    pastorName: 'Senior Pastor',
    phone: '+91 97040 90069',
    serviceTimes: ['Sunday 07:00 AM (Telugu)', 'Sunday 09:30 AM (English & Hindi)', 'Wednesday 07:00 PM (Bible Study)'],
    mapCoordinates: { lat: 17.5085, lng: 78.4116 },
  },
  {
    id: 'branch_banjara_hills',
    name: 'KCM Banjara Hills Campus',
    slug: 'banjara-hills',
    address: 'Road No. 12, Banjara Hills, Hyderabad, 500034',
    pastorName: 'Associate Pastor',
    phone: '+91 97040 90069',
    serviceTimes: ['Sunday 08:30 AM (English)', 'Sunday 11:00 AM (Youth & Family)', 'Friday 07:00 PM (Praise & Worship)'],
    mapCoordinates: { lat: 17.4156, lng: 78.4357 },
  },
  {
    id: 'branch_secunderabad',
    name: 'KCM Secunderabad Campus',
    slug: 'secunderabad',
    address: 'Clock Tower Road, Secunderabad, 500003',
    pastorName: 'Camp Minister',
    phone: '+91 97040 90069',
    serviceTimes: ['Sunday 08:00 AM (Telugu & English)', 'Sunday 06:00 PM (Evangelism Service)'],
    mapCoordinates: { lat: 17.4411, lng: 78.4983 },
  },
];

export class BranchesService {
  static async getBranches(): Promise<ApiResponse<ChurchBranch[]>> {
    return api.get('/api/branches');
  }

  static async getBranchBySlug(slug: string): Promise<ApiResponse<ChurchBranch>> {
    return api.get(`/api/branches/${slug}`);
  }
}

