/**
 * src/modules/groups/groups.service.ts
 * Small Groups, Home Cell Fellowships, and Discipleship circles.
 */

export interface SmallGroup {
  id: string;
  name: string;
  leader: string;
  area: string;
  meetingDay: string;
  meetingTime: string;
}

const GROUPS: SmallGroup[] = [
  { id: 'grp_kukatpally_north', name: 'Kukatpally North Cell Fellowship', leader: 'Elder David', area: 'KPHB Colony', meetingDay: 'Wednesday', meetingTime: '7:00 PM' },
  { id: 'grp_banjara_hills_cell', name: 'Banjara Hills Young Adults Circle', leader: 'Bro. Samuel', area: 'Road No. 12', meetingDay: 'Thursday', meetingTime: '7:30 PM' },
  { id: 'grp_secunderabad_east', name: 'Secunderabad East Family Life Group', leader: 'Pastor Joshua', area: 'Marredpally', meetingDay: 'Tuesday', meetingTime: '7:00 PM' },
];

export class GroupsService {
  public getSmallGroups(): SmallGroup[] {
    return GROUPS;
  }
}

export const groupsService = new GroupsService();

