import { prisma } from '@/lib/prisma';
import { logEvent, LogLevel } from './logger';

export async function writeAuditLog(data: {
  userId?: string | null;
  action: string;
  details: string;
  ipAddress?: string | null;
  userAgent?: string | null;
}) {
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

    // Mirror to standard logs
    const isSecurity = data.action.includes('SECURITY') || data.action.includes('UNAUTHORIZED') || data.action.includes('FAILED');
    logEvent(
      isSecurity ? LogLevel.SECURITY : LogLevel.INFO,
      `AUDIT_${data.action}`,
      data.details,
      { userId: data.userId || 'SYSTEM' }
    );
  } catch (err: any) {
    console.error('[AUDIT_LOG] Database insert failed:', err.message);
  }
}
