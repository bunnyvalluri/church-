/**
 * src/jobs/notificationWorker.ts
 * Background worker for asynchronous notification dispatch and retries.
 */

import { Worker, Job } from 'bullmq';
import { getRedisClient } from '../infrastructure/redis/client';
import { QUEUES } from '../shared/constants';
import { logger } from '../shared/logger';
import { notificationsService } from '../modules/notifications/notifications.service';

let worker: Worker | null = null;

export function initializeNotificationWorker(): Worker | null {
  const connection = getRedisClient();
  if (!connection) {
    logger.debug('[WORKER] Redis offline. Notification worker disabled.');
    return null;
  }

  try {
    worker = new Worker(
      QUEUES.NOTIFICATIONS,
      async (job: Job) => {
        logger.info(`[NOTIF_WORKER] Processing notification job ${job.id}`, job.data);
        const { title, body, data } = job.data;
        return notificationsService.broadcastNotification(title, body, data);
      },
      { connection: connection as any }
    );

    worker.on('completed', (job: Job) => {
      logger.info(`[NOTIF_WORKER] Successfully sent notification ${job.id}`);
    });

    worker.on('failed', (job: Job | undefined, err: Error) => {
      logger.warn(`[NOTIF_WORKER] Job ${job?.id} failed: ${err.message}`);
    });

    logger.info('[NOTIF_WORKER] Notification worker initialized and listening.');
    return worker;
  } catch (err: any) {
    logger.warn(`[NOTIF_WORKER] Initialization failed: ${err.message}`);
    return null;
  }
}

export async function closeNotificationWorker(): Promise<void> {
  if (worker) {
    await worker.close();
    worker = null;
  }
}

