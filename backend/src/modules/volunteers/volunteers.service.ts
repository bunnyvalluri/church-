/**
 * src/modules/volunteers/volunteers.service.ts
 * Church volunteer departments, applications, and scheduling.
 */

import { BadRequestError } from '../../shared/errors';

export interface VolunteerDepartment {
  id: string;
  name: string;
  description: string;
  leader: string;
}

const DEPARTMENTS: VolunteerDepartment[] = [
  { id: 'dept_worship', name: 'Worship & Music Team', description: 'Vocalists, musicians, choir', leader: 'Worship Pastor' },
  { id: 'dept_media', name: 'Media & Sound Production', description: 'Audio engineering, cameras, live streaming', leader: 'Media Director' },
  { id: 'dept_ushers', name: 'Ushering & Welcome Protocol', description: 'Guest greeting, sanctuary seating, bulletin distribution', leader: 'Head Usher' },
  { id: 'dept_children', name: 'Sunday School & Kids Ministry', description: 'Teaching children Bible stories and activities', leader: 'Children Director' },
  { id: 'dept_outreach', name: 'Evangelism & NGO Outreach', description: 'Community feeding, visitation, prayers', leader: 'Outreach Pastor' },
];

export class VolunteersService {
  public getDepartments(): VolunteerDepartment[] {
    return DEPARTMENTS;
  }

  public async apply(userId: string, departmentId: string, notes?: string) {
    const dept = DEPARTMENTS.find((d) => d.id === departmentId);
    if (!dept) throw new BadRequestError('Invalid volunteer department.');

    return {
      id: `vol_${Date.now()}`,
      userId,
      departmentId,
      departmentName: dept.name,
      status: 'PENDING_REVIEW',
      submittedAt: new Date(),
      notes: notes || '',
    };
  }
}

export const volunteersService = new VolunteersService();

