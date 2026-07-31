/**
 * backend/src/queues/retrySystem.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Exponential Backoff Retry Engine with Jitter & Dead-Letter Queue (DLQ) Routing.
 * ─────────────────────────────────────────────────────────────────────────────
 */

const { logAuditEvent } = require('../services/auditLogger');

/**
 * Calculates exponential backoff delay with random jitter.
 * Formula: min(maxDelay, baseDelay * 2^(attempt - 1)) + random_jitter(0, 1000ms)
 */
function calculateBackoffWithJitter(attempt, baseDelayMs = 2000, maxDelayMs = 60000) {
  const exponential = baseDelayMs * Math.pow(2, Math.max(0, attempt - 1));
  const capped = Math.min(maxDelayMs, exponential);
  const jitter = Math.floor(Math.random() * 1000);
  return capped + jitter;
}

/**
 * Handles failed worker job. Retries if attempt < maxAttempts, otherwise routes to DLQ.
 */
async function handleJobFailure(job, error, loopName, maxAttempts = 5) {
  const currentAttempt = job.attemptsMade || 1;

  if (currentAttempt < maxAttempts) {
    const delay = calculateBackoffWithJitter(currentAttempt);
    console.warn(`[RETRY_SYSTEM] [${loopName}] Job #${job.id || 'N/A'} failed (Attempt ${currentAttempt}/${maxAttempts}). Retrying in ${delay}ms... Error: ${error.message}`);
    
    await logAuditEvent({
      action: 'JOB_RETRY_SCHEDULED',
      entity: 'QUEUE_JOB',
      entityId: String(job.id || 'N/A'),
      details: { loopName, attempt: currentAttempt, maxAttempts, delayMs: delay, error: error.message },
      severity: 'WARN',
      loopName,
    });

    return { shouldRetry: true, delay };
  } else {
    // Route to Dead-Letter Queue (DLQ)
    console.error(`[DLQ_EXHAUSTED] [${loopName}] Job #${job.id || 'N/A'} exhausted max retries (${maxAttempts}). Routed to Dead-Letter Queue. Error: ${error.message}`);
    
    await logAuditEvent({
      action: 'DEAD_LETTER_QUEUE_DUMP',
      entity: 'DLQ_JOB',
      entityId: String(job.id || 'N/A'),
      details: { loopName, totalAttempts: currentAttempt, payload: job.data, error: error.message },
      severity: 'ERROR',
      loopName,
    });

    return { shouldRetry: false, routedToDLQ: true };
  }
}

module.exports = {
  calculateBackoffWithJitter,
  handleJobFailure,
};
