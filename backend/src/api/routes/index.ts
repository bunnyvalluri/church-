/**
 * src/api/routes/index.ts
 * Master Router assembling all 20 modular domain subrouters.
 */

import { Router } from 'express';
import { authRoutes } from '../../modules/auth/auth.routes';
import { usersRoutes } from '../../modules/users/users.routes';
import { membersRoutes } from '../../modules/members/members.routes';
import { branchesRoutes } from '../../modules/branches/branches.routes';
import { eventsRoutes } from '../../modules/events/events.routes';
import { attendanceRoutes } from '../../modules/attendance/attendance.routes';
import { sermonsRoutes } from '../../modules/sermons/sermons.routes';
import { prayersRoutes } from '../../modules/prayers/prayers.routes';
import { donationsRoutes } from '../../modules/donations/donations.routes';
import { financeRoutes } from '../../modules/finance/finance.routes';
import { notificationsRoutes } from '../../modules/notifications/notifications.routes';
import { mediaRoutes } from '../../modules/media/media.routes';
import { ngoRoutes } from '../../modules/ngo/ngo.routes';
import { volunteersRoutes } from '../../modules/volunteers/volunteers.routes';
import { groupsRoutes } from '../../modules/groups/groups.routes';
import { announcementsRoutes } from '../../modules/announcements/announcements.routes';
import { offlineSyncRoutes } from '../../modules/offline-sync/offlineSync.routes';
import { reportsRoutes } from '../../modules/reports/reports.routes';
import { auditLogsRoutes } from '../../modules/audit-logs/auditLogs.routes';
import { adminRoutes } from '../../modules/administration/admin.routes';

const masterRouter = Router();

masterRouter.use('/auth', authRoutes);
masterRouter.use('/users', usersRoutes);
masterRouter.use('/members', membersRoutes);
masterRouter.use('/branches', branchesRoutes);
masterRouter.use('/events', eventsRoutes);
masterRouter.use('/attendance', attendanceRoutes);
masterRouter.use('/sermons', sermonsRoutes);
masterRouter.use('/prayers', prayersRoutes);
masterRouter.use('/donations', donationsRoutes);
masterRouter.use('/finance', financeRoutes);
masterRouter.use('/notifications', notificationsRoutes);
masterRouter.use('/media', mediaRoutes);
masterRouter.use('/ngo', ngoRoutes);
masterRouter.use('/volunteers', volunteersRoutes);
masterRouter.use('/groups', groupsRoutes);
masterRouter.use('/announcements', announcementsRoutes);
masterRouter.use('/offline-sync', offlineSyncRoutes);
masterRouter.use('/reports', reportsRoutes);
masterRouter.use('/audit-logs', auditLogsRoutes);
masterRouter.use('/admin', adminRoutes);

export const apiRouter = masterRouter;

