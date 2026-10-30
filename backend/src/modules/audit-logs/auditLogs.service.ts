/**
 * src/modules/audit-logs/auditLogs.service.ts
 * Querying and inspecting centralized audit trails.
 */

import { prisma } from '../../infrastructure/prisma/client';
import { env } from '../../config/env';
import { getPaginationParams, createPaginatedResponse } from '../../shared/utils';

export class AuditLogsService {
  public async listAuditLogs(query: any) {
    const { page, limit, skip } = getPaginationParams(query);

    if (env.DB_OFFLINE) {
      return createPaginatedResponse<any>(
        [
          {
            id: 'aud_1',
            action: 'USER_LOGIN',
            userId: 'usr_admin',
            details: '{"method":"GOOGLE_GIS"}',
            createdAt: new Date(),
          },
        ],
        1,
        page,
        limit
      );
    }

    const [items, total] = await Promise.all([
      prisma.auditLog.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.auditLog.count(),
    ]);

    return createPaginatedResponse<any>(items, total, page, limit);
  }
}

export const auditLogsService = new AuditLogsService();
