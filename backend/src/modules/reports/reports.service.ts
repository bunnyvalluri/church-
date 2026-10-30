/**
 * src/modules/reports/reports.service.ts
 * Master church analytics and operational reporting service.
 */

import { prisma } from '../../infrastructure/prisma/client';
import { env } from '../../config/env';

export class ReportsService {
  public async getDashboardOverview() {
    if (env.DB_OFFLINE) {
      return {
        totalMembers: 1240,
        activeEvents: 3,
        totalDonationsThisMonthINR: 245000,
        pendingPrayers: 14,
        systemStatus: 'OPERATIONAL',
      };
    }

    const [membersCount, eventsCount, prayersCount] = await Promise.all([
      prisma.user.count(),
      prisma.event.count(),
      prisma.prayerRequest.count({ where: { status: 'PENDING' } }),
    ]);

    return {
      totalMembers: membersCount,
      activeEvents: eventsCount,
      pendingPrayers: prayersCount,
      generatedAt: new Date().toISOString(),
    };
  }
}

export const reportsService = new ReportsService();

