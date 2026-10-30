/**
 * src/infrastructure/bullmq/queueManager.ts
 * BullMQ Queue manager with safe fallback when Redis is offline.
 */

import { Queue } from 'bullmq';
import { getRedisClient } from '../redis/client';
import { QUEUES } from '../../shared/constants';
import { logger } from '../../shared/logger';

const queues: Map<string, Queue> = new Map();

export function getQueue(queueName: string): Queue | null {
  if (queues.has(queueName)) {
    return queues.get(queueName)!;
  }

  const connection = getRedisClient();
  if (!connection) {
    return null;
  }

  try {
    const queue = new Queue(queueName, { connection: connection as any });
    queue.on('error', (err) => {
      logger.warn(`[QUEUE:${queueName}] Queue warning: ${err.message}`);
    });
    queues.set(queueName, queue);
    return queue;
  } catch (err: any) {
    logger.warn(`[QUEUE:${queueName}] Could not initialize queue: ${err.message}`);
    return null;
  }
}

export async function addJob(queueName: string, jobName: string, data: any, opts: any = {}): Promise<boolean> {
  const queue = getQueue(queueName);
  if (!queue) {
    logger.debug(`[QUEUE] BullMQ offline. Bypassing async queue for ${jobName}.`);
    return false;
  }
  try {
    await queue.add(jobName, data, {
      attempts: 3,
      backoff: { type: 'exponential', delay: 2000 },
      removeOnComplete: true,
      removeOnFail: false,
      ...opts,
    });
    return true;
  } catch (err: any) {
    logger.warn(`[QUEUE] Error enqueueing job ${jobName}: ${err.message}`);
    return false;
  }
}

