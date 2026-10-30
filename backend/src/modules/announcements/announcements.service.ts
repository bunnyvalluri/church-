/**
 * src/modules/announcements/announcements.service.ts
 * Church-wide and branch-scoped bulletins and announcements.
 */

import { eventPublisher } from '../../application/services/eventPublisher';
import { BadRequestError } from '../../shared/errors';

export interface Announcement {
  id: string;
  title: string;
  content: string;
  priority: 'NORMAL' | 'HIGH' | 'URGENT';
  branchId?: string | null;
  createdAt: string;
}

const ANNOUNCEMENTS: Announcement[] = [
  {
    id: 'anc_1',
    title: 'Special Fasting & Prayer Week',
    content: 'Join us across all 3 campuses for special evening revival prayer meetings this Wednesday through Friday.',
    priority: 'HIGH',
    branchId: null,
    createdAt: new Date().toISOString(),
  },
];

export class AnnouncementsService {
  public getAnnouncements(branchId?: string): Announcement[] {
    if (!branchId) return ANNOUNCEMENTS;
    return ANNOUNCEMENTS.filter((a) => !a.branchId || a.branchId === branchId);
  }

  public async createAnnouncement(data: { title: string; content: string; priority?: 'NORMAL' | 'HIGH' | 'URGENT'; branchId?: string }) {
    if (!data.title || !data.content) {
      throw new BadRequestError('Announcement title and content are required.');
    }
    const record: Announcement = {
      id: `anc_${Date.now()}`,
      title: data.title,
      content: data.content,
      priority: data.priority || 'NORMAL',
      branchId: data.branchId || null,
      createdAt: new Date().toISOString(),
    };
    ANNOUNCEMENTS.unshift(record);

    // Emit live to online church congregation
    await eventPublisher.publishRealtime('announcement:new', record, record.branchId || 'kcm-global');

    return record;
  }
}

export const announcementsService = new AnnouncementsService();

