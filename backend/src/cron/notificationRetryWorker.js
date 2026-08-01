/**
 * backend/src/cron/notificationRetryWorker.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Notification retry cron worker.
 * Runs every 15 minutes (configured in loops/config.js: `notificationRetry`).
 * Processes failed notification jobs with exponential backoff.
 *
 * Schedule: Every 15 minutes
 * Max attempts per job: 3
 * Backoff: 2^attempts * 5000ms (5s, 10s, 20s)
 * After maxAttempts: Marks as DEAD_LETTER + creates AuditLog entry
 * ─────────────────────────────────────────────────────────────────────────────
 */

'use strict';

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });
require('dotenv').config({ path: path.join(__dirname, '../../../.env') });

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const { sendEventEmail }      = require('../services/emailService');
const { sendEventSMS }        = require('../services/smsService');
const { sendEventWhatsApp }   = require('../services/whatsappService');
const { logAuditEvent }       = require('../services/auditLogger');

/**
 * Calculate next retry time using exponential backoff.
 * @param {number} attempts - Current attempt count
 * @returns {Date}
 */
function _nextRetryAt(attempts) {
  const delayMs = Math.pow(2, attempts) * 5000; // 5s, 10s, 20s
  const jitter  = Math.random() * 1000; // Add jitter to avoid thundering herd
  return new Date(Date.now() + delayMs + jitter);
}

/**
 * Retry a single notification job.
 * @param {Object} job - EventNotificationRetryJob record
 * @returns {Promise<{success: boolean, error?: string}>}
 */
async function _retryJob(job) {
  const payload = job.payload || {};
  const event   = payload.event || { id: job.eventId, title: payload.eventTitle || 'KCM Event' };
  const member  = {
    fullName:  payload.memberName || 'Beloved Member',
    email:     payload.address || job.memberEmail || null,
    mobile:    payload.address || null,
    whatsapp:  payload.address || null,
  };

  try {
    let result;

    switch (job.channel) {
      case 'EMAIL':
        result = await sendEventEmail(member, event);
        break;

      case 'SMS':
        member.mobile = payload.address || null;
        result = await sendEventSMS(member, event);
        break;

      case 'WHATSAPP':
        member.whatsapp = payload.address || null;
        result = await sendEventWhatsApp(member, event);
        break;

      default:
        console.warn(`[RETRY_WORKER] Unknown channel: ${job.channel}`);
        return { success: false, error: `Unknown channel: ${job.channel}` };
    }

    return result;

  } catch (err) {
    return { success: false, error: err.message };
  }
}

/**
 * Main retry worker function.
 * Called by the cron scheduler every 15 minutes.
 *
 * @returns {Promise<{processed: number, succeeded: number, failed: number, deadLettered: number}>}
 */
async function runNotificationRetryWorker() {
  console.log('[RETRY_WORKER] ── Starting notification retry scan ──');

  // Check if the model exists (may not be migrated yet)
  const modelExists = !!prisma.eventNotificationRetryJob;
  if (!modelExists) {
    console.log('[RETRY_WORKER] EventNotificationRetryJob table not found — migration pending. Skipping.');
    return { processed: 0, succeeded: 0, failed: 0, deadLettered: 0 };
  }

  // Fetch pending jobs that are due for retry
  let pendingJobs;
  try {
    pendingJobs = await prisma.eventNotificationRetryJob.findMany({
      where: {
        status:      { in: ['PENDING', 'RETRYING'] },
        nextRetryAt: { lte: new Date() },
      },
      orderBy: { nextRetryAt: 'asc' },
      take: 50, // Process max 50 jobs per run
    });
  } catch (err) {
    console.warn('[RETRY_WORKER] Failed to fetch retry jobs:', err.message);
    return { processed: 0, succeeded: 0, failed: 0, deadLettered: 0 };
  }

  if (pendingJobs.length === 0) {
    console.log('[RETRY_WORKER] No pending retry jobs found.');
    return { processed: 0, succeeded: 0, failed: 0, deadLettered: 0 };
  }

  console.log(`[RETRY_WORKER] Processing ${pendingJobs.length} retry jobs...`);

  let succeeded = 0, failed = 0, deadLettered = 0;

  for (const job of pendingJobs) {
    const newAttempts = job.attempts + 1;

    // Mark as IN_PROGRESS
    try {
      await prisma.eventNotificationRetryJob.update({
        where:  { id: job.id },
        data:   { status: 'IN_PROGRESS' },
      });
    } catch (err) {
      console.warn(`[RETRY_WORKER] Could not mark job ${job.id} as IN_PROGRESS:`, err.message);
      continue;
    }

    // Attempt retry
    const result = await _retryJob(job);

    if (result.success) {
      // Mark complete
      await prisma.eventNotificationRetryJob.update({
        where: { id: job.id },
        data: {
          status:      'COMPLETED',
          attempts:    newAttempts,
          completedAt: new Date(),
          lastError:   null,
        },
      }).catch(() => {});

      succeeded++;
      console.log(`[RETRY_WORKER] ✓ Job ${job.id} (${job.channel}) succeeded on attempt ${newAttempts}.`);

    } else if (newAttempts >= job.maxAttempts) {
      // Dead letter
      await prisma.eventNotificationRetryJob.update({
        where: { id: job.id },
        data: {
          status:    'DEAD_LETTER',
          attempts:  newAttempts,
          lastError: result.error || 'Max attempts reached',
        },
      }).catch(() => {});

      deadLettered++;
      console.warn(`[RETRY_WORKER] ✗ Job ${job.id} (${job.channel}) dead-lettered after ${newAttempts} attempts.`);

      // Audit log for dead letter
      await logAuditEvent({
        action:   'NOTIFICATION_DEAD_LETTER',
        entity:   'EVENT',
        entityId: job.eventId,
        details: {
          channel:  job.channel,
          attempts: newAttempts,
          error:    result.error,
          payload:  job.payload,
        },
        severity: 'WARNING',
        loopName: 'Notification Retry Worker',
      }).catch(() => {});

    } else {
      // Schedule next retry with backoff
      const nextRetryAt = _nextRetryAt(newAttempts);

      await prisma.eventNotificationRetryJob.update({
        where: { id: job.id },
        data: {
          status:      'PENDING',
          attempts:    newAttempts,
          nextRetryAt,
          lastError:   result.error || 'Unknown error',
        },
      }).catch(() => {});

      failed++;
      console.warn(`[RETRY_WORKER] Job ${job.id} (${job.channel}) failed (attempt ${newAttempts}/${job.maxAttempts}). Next retry: ${nextRetryAt.toISOString()}`);
    }

    // Small delay between jobs
    await new Promise(r => setTimeout(r, 200));
  }

  const summary = { processed: pendingJobs.length, succeeded, failed, deadLettered };
  console.log('[RETRY_WORKER] ── Retry scan complete ──', summary);
  return summary;
}

module.exports = { runNotificationRetryWorker };

// ── CLI execution ─────────────────────────────────────────────────────────────
if (require.main === module) {
  runNotificationRetryWorker()
    .then(summary => {
      console.log('[RETRY_WORKER] Manual run complete:', summary);
      process.exit(0);
    })
    .catch(err => {
      console.error('[RETRY_WORKER] Fatal error:', err.message);
      process.exit(1);
    });
}
