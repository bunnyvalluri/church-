/**
 * src/application/services/auditService.ts
 * Centralized audit trail service storing security and data mutations in PostgreSQL and MongoDB.
 */

import { prisma } from '../../infrastructure/prisma/client';
import { getMongoDb } from '../../infrastructure/mongodb/mongoClient';
import { logger } from '../../shared/logger';

export interface AuditLogParams {
  userId?: string | null;
  action: string;
  resource: string;
  resourceId?: string | null;
  status?: 'SUCCESS' | 'FAILURE';
  ipAddress?: string | null;
  userAgent?: string | null;
  details?: Record<string, any>;
}

export class AuditService {
  public static async log(params: AuditLogParams): Promise<void> {
    const timestamp = new Date();

    // 1. Log structured to stdout
    logger.info(`[AUDIT] ${params.action} on ${params.resource}`, {
      userId: params.userId,
      resourceId: params.resourceId,
      status: params.status || 'SUCCESS',
      ip: params.ipAddress,
    });

    // 2. Try recording in PostgreSQL audit table if user exists
    try {
      if (params.userId) {
        await prisma.auditLog.create({
          data: {
            userId: params.userId,
            action: params.action,
            details: JSON.stringify(params.details || {}),
            ipAddress: params.ipAddress || null,
            userAgent: params.userAgent || null,
          },
        });
      }
    } catch (err: any) {
      logger.debug('[AUDIT] PostgreSQL write skipped:', { error: err.message });
    }

    // 3. Dual-write to MongoDB Atlas for high-throughput operational audit streams
    try {
      const db = await getMongoDb();
      if (db) {
        await db.collection('audit_events').insertOne({
          ...params,
          timestamp,
        });
      }
    } catch (err: any) {
      logger.debug('[AUDIT] MongoDB write skipped:', { error: err.message });
    }
  }
}
