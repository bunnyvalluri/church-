/**
 * src/jobs/mediaWorker.ts
 * Background worker for asynchronous media optimization.
 */

import { Worker, Job } from 'bullmq';
import { getRedisClient } from '../infrastructure/redis/client';
import { QUEUES } from '../shared/constants';
import { logger } from '../shared/logger';

let worker: Worker | null = null;

export function initializeMediaWorker(): Worker | null {
  const connection = getRedisClient();
  if (!connection) {
    logger.debug('[WORKER] Redis offline. Media BullMQ worker disabled.');
    return null;
  }

  try {
    worker = new Worker(
      QUEUES.MEDIA_UPLOADS,
      async (job: Job) => {
        logger.info(`[MEDIA_WORKER] Processing media optimization for job ${job.id}`, job.data);
        // Simulate async image resizing / CDN prefetching
        await new Promise((r) => setTimeout(r, 1000));
        return { optimized: true, assetUrl: job.data.assetUrl };
      },
      { connection: connection as any }
    );

    worker.on('completed', (job: Job) => {
      logger.info(`[MEDIA_WORKER] Completed job ${job.id}`);
    });

    worker.on('failed', (job: Job | undefined, err: Error) => {
      logger.warn(`[MEDIA_WORKER] Failed job ${job?.id}: ${err.message}`);
    });

    logger.info('[MEDIA_WORKER] Media worker initialized and listening.');
    return worker;
  } catch (err: any) {
    logger.warn(`[MEDIA_WORKER] Initialization failed: ${err.message}`);
    return null;
  }
}

export async function closeMediaWorker(): Promise<void> {
  if (worker) {
    await worker.close();
    worker = null;
  }
}

