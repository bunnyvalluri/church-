/**
 * lib/donationRetryQueue.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * DB-persisted retry queue for donation background jobs.
 *
 * Features:
 *  • Jobs survive server restarts (persisted to PostgreSQL via Prisma)
 *  • Exponential backoff: 30s → 2min → 10min → dead letter
 *  • Concurrent-safe: uses DB status to prevent double-execution
 *  • Per-job-type handlers (pluggable)
 *  • Dead letter queue for manual inspection
 *  • Full observability via DonationAgentEvent log
 */

import { prisma } from '@/lib/prisma';
import { writeAuditLog } from '@/lib/auditLogger';
import { sanitizeAuditField } from '@/lib/security';

// ─── Job Types ────────────────────────────────────────────────────────────────

export type RetryJobType =
  | 'NOTIFICATION_SMS'
  | 'NOTIFICATION_EMAIL'
  | 'NOTIFICATION_WHATSAPP'
  | 'NOTIFICATION_PUSH'
  | 'RECEIPT_GENERATE'
  | 'ADMIN_ALERT'
  | 'DASHBOARD_UPDATE'
  | 'ANALYTICS_FLUSH';

export interface RetryJobPayload {
  donationId: string;
  sessionId?: string;
  [key: string]: unknown;
}

// ─── Backoff Schedule ─────────────────────────────────────────────────────────

const BACKOFF_DELAYS_MS = [
  30 * 1000,      // attempt 1 → retry after 30s
  2 * 60 * 1000,  // attempt 2 → retry after 2 min
  10 * 60 * 1000, // attempt 3 → retry after 10 min
];

function nextRetryDelay(attempts: number): number {
  return BACKOFF_DELAYS_MS[Math.min(attempts, BACKOFF_DELAYS_MS.length - 1)];
}

// ─── Enqueue Job ──────────────────────────────────────────────────────────────

/**
 * Add a job to the retry queue.
 * Call this when a background task fails and should be retried.
 */
export async function enqueueRetryJob(
  jobType: RetryJobType,
  payload: RetryJobPayload,
  options: { maxAttempts?: number; delayMs?: number } = {}
): Promise<string> {
  const { maxAttempts = 3, delayMs = 0 } = options;
  const nextRetryAt = new Date(Date.now() + delayMs);

  const job = await prisma.donationRetryJob.create({
    data: {
      donationId: payload.donationId,
      sessionId: payload.sessionId,
      jobType,
      status: 'PENDING',
      attempts: 0,
      maxAttempts,
      nextRetryAt,
      payload: payload as any,
    },
  });

  console.log(`[RETRY_QUEUE] Enqueued ${jobType} job ${job.id} for donation ${payload.donationId}`);
  return job.id;
}

// ─── Execute a Single Job ─────────────────────────────────────────────────────

type JobHandler = (payload: RetryJobPayload) => Promise<void>;
const handlers = new Map<RetryJobType, JobHandler>();

/** Register a handler for a specific job type */
export function registerJobHandler(type: RetryJobType, handler: JobHandler) {
  handlers.set(type, handler);
}

/**
 * Execute a single pending job.
 * Uses optimistic locking via status update to prevent concurrent execution.
 */
export async function executeJob(jobId: string): Promise<boolean> {
  // Claim the job atomically
  const claimed = await prisma.donationRetryJob.updateMany({
    where: { id: jobId, status: 'PENDING' },
    data: { status: 'IN_PROGRESS', attempts: { increment: 1 } },
  });

  if (claimed.count === 0) {
    return false; // Already claimed by another worker
  }

  const job = await prisma.donationRetryJob.findUnique({ where: { id: jobId } });
  if (!job) return false;

  const handler = handlers.get(job.jobType as RetryJobType);

  if (!handler) {
    await prisma.donationRetryJob.update({
      where: { id: jobId },
      data: {
        status: 'DEAD_LETTER',
        lastError: `No handler registered for job type: ${job.jobType}`,
      },
    });
    return false;
  }

  try {
    await handler(job.payload as RetryJobPayload);

    await prisma.donationRetryJob.update({
      where: { id: jobId },
      data: { status: 'COMPLETED', completedAt: new Date() },
    });

    // Log success event
    await logAgentEvent(job.donationId, job.sessionId, `RETRY_JOB_COMPLETED`, {
      jobId,
      jobType: job.jobType,
      attempts: job.attempts,
    });

    return true;
  } catch (err: any) {
    const errorMsg = sanitizeAuditField(err?.message || 'Unknown error', 300);
    const nextAttempt = job.attempts + 1;
    const isDeadLetter = nextAttempt >= job.maxAttempts;

    await prisma.donationRetryJob.update({
      where: { id: jobId },
      data: {
        status: isDeadLetter ? 'DEAD_LETTER' : 'PENDING',
        lastError: errorMsg,
        nextRetryAt: isDeadLetter ? undefined : new Date(Date.now() + nextRetryDelay(nextAttempt)),
      },
    });

    if (isDeadLetter) {
      await writeAuditLog({
        action: 'RETRY_JOB_DEAD_LETTER',
        details: sanitizeAuditField(
          `Job ${jobId} (${job.jobType}) for donation ${job.donationId} exhausted ${job.maxAttempts} attempts. Last error: ${errorMsg}`
        ),
      });
      console.error(`[RETRY_QUEUE] Job ${jobId} moved to dead letter queue after ${job.maxAttempts} attempts`);
    }

    return false;
  }
}

// ─── Process Due Jobs ─────────────────────────────────────────────────────────

/**
 * Process all jobs that are due for retry.
 * Call this from a cron job or API route (e.g. every 30 seconds).
 *
 * @param limit Max jobs to process per batch (default: 20)
 */
export async function processDueJobs(limit = 20): Promise<{ processed: number; failed: number }> {
  const now = new Date();

  const dueJobs = await prisma.donationRetryJob.findMany({
    where: {
      status: 'PENDING',
      nextRetryAt: { lte: now },
    },
    orderBy: { nextRetryAt: 'asc' },
    take: limit,
    select: { id: true, jobType: true },
  });

  let processed = 0;
  let failed = 0;

  for (const job of dueJobs) {
    const success = await executeJob(job.id);
    if (success) processed++;
    else failed++;
  }

  if (dueJobs.length > 0) {
    console.log(`[RETRY_QUEUE] Processed ${processed} jobs, ${failed} failed (${dueJobs.length} total due)`);
  }

  return { processed, failed };
}

// ─── Enqueue Notification Retries ─────────────────────────────────────────────

/**
 * Convenience: enqueue all notification channels for retry after a donation.
 * Call this after a channel failure instead of dropping the notification.
 */
export async function enqueueNotificationRetries(
  donationId: string,
  sessionId: string | undefined,
  channels: Array<'SMS' | 'EMAIL' | 'WHATSAPP' | 'PUSH'>,
  notificationPayload: Record<string, unknown>
): Promise<void> {
  const enqueues = channels.map((channel) =>
    enqueueRetryJob(
      `NOTIFICATION_${channel}` as RetryJobType,
      { donationId, sessionId, ...notificationPayload },
      { delayMs: 30_000 } // Start first retry after 30s
    ).catch((err) => console.error(`[RETRY_QUEUE] Failed to enqueue ${channel} retry:`, err))
  );

  await Promise.allSettled(enqueues);
}

// ─── Queue Stats ──────────────────────────────────────────────────────────────

export async function getQueueStats(): Promise<{
  pending: number;
  inProgress: number;
  completed: number;
  failed: number;
  deadLetter: number;
}> {
  const [pending, inProgress, completed, failed, deadLetter] = await Promise.all([
    prisma.donationRetryJob.count({ where: { status: 'PENDING' } }),
    prisma.donationRetryJob.count({ where: { status: 'IN_PROGRESS' } }),
    prisma.donationRetryJob.count({ where: { status: 'COMPLETED' } }),
    prisma.donationRetryJob.count({ where: { status: 'FAILED' } }),
    prisma.donationRetryJob.count({ where: { status: 'DEAD_LETTER' } }),
  ]);

  return { pending, inProgress, completed, failed, deadLetter };
}

// ─── Shared Agent Event Logger ─────────────────────────────────────────────────

export async function logAgentEvent(
  donationId: string | null | undefined,
  sessionId: string | null | undefined,
  event: string,
  metadata: Record<string, unknown> = {}
): Promise<void> {
  try {
    await prisma.donationAgentEvent.create({
      data: {
        donationId: donationId || undefined,
        sessionId: sessionId || undefined,
        event,
        metadata: metadata as any,
        createdAt: new Date(),
      },
    });
  } catch (err) {
    // Non-blocking — never let analytics failure affect the payment flow
    console.warn('[AGENT_EVENT] Failed to log event:', event, err);
  }
}
