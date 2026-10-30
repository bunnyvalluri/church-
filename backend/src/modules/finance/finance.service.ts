/**
 * src/modules/finance/finance.service.ts
 * Financial integrity, audit reconciliation, and accounting reporting service.
 */

import { prisma } from '../../infrastructure/prisma/client';
import { env } from '../../config/env';

export class FinanceService {
  public async getSummary(startDate?: string, endDate?: string) {
    if (env.DB_OFFLINE) {
      return {
        totalReceivedINR: 154000,
        funds: { TITHE: 90000, OFFERING: 40000, NGO_FEEDING: 24000 },
        transactionCount: 42,
      };
    }

    const where: any = { status: 'SUCCESS' };
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) where.createdAt.lte = new Date(endDate);
    }

    const donations = await prisma.donation.findMany({ where });
    const total = donations.reduce((acc, curr) => acc + curr.amount, 0);

    return {
      totalReceivedINR: total,
      transactionCount: donations.length,
      timestamp: new Date().toISOString(),
    };
  }
}

export const financeService = new FinanceService();

