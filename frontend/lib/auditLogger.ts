import { prisma } from '@/lib/prisma';
import { logEvent, LogLevel } from './logger';
import { recordAuditEvent } from '@/lib/mongodb/services/auditService';
import { trackActivity } from '@/lib/mongodb/services/activityService';

export async function writeAuditLog(data: {
  userId?: string | null;
  action: string;
  details: string;
  ipAddress?: string | null;
  userAgent?: string | null;
}) {
  // 1. Write to PostgreSQL for relational continuity
  try {
    await prisma.auditLog.create({
      data: {
        userId: data.userId || null,
        action: data.action,
        details: data.details,
        ipAddress: data.ipAddress || null,
        userAgent: data.userAgent || null,
      },
    });
  } catch (err: any) {
    console.warn('[AUDIT_LOG_PG_WARN] Database insert failed:', err.message);
  }

  // 2. Mirror to MongoDB Atlas audit_events & activity_logs (non-blocking)
  try {
    recordAuditEvent({
      actorId: data.userId || 'SYSTEM',
      actorRole: 'SYSTEM',
      action: data.action,
      resource: 'audit_log',
      resourceId: data.userId || 'SYSTEM',
      metadata: { details: data.details },
      ipAddress: data.ipAddress,
    }).catch(() => {});

    trackActivity({
      actorId: data.userId || 'SYSTEM',
      actorRole: 'SYSTEM',
      action: data.action,
      entityType: 'audit',
      entityId: data.userId || 'system',
      metadata: { details: data.details },
      ipAddress: data.ipAddress,
      userAgent: data.userAgent,
    }).catch(() => {});
  } catch (mongoErr: any) {
    // Non-blocking
  }

  // 3. Mirror to standard logs for Loki / stdout
  const isSecurity = data.action.includes('SECURITY') || data.action.includes('UNAUTHORIZED') || data.action.includes('FAILED');
  logEvent(
    isSecurity ? LogLevel.SECURITY : LogLevel.INFO,
    `AUDIT_${data.action}`,
    data.details,
    { userId: data.userId || 'SYSTEM' }
  );
}

