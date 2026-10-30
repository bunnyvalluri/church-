/**
 * src/infrastructure/redis/client.ts
 * Redis connection singleton with reconnection resilience and offline safety.
 */

import Redis from 'ioredis';
import { redisConfig } from '../../config/redis';
import { logger } from '../../shared/logger';

let redisClient: Redis | null = null;

export function getRedisClient(): Redis | null {
  if (redisConfig.disabled) {
    return null;
  }

  if (!redisClient) {
    try {
      redisClient = new Redis(redisConfig.url, redisConfig.options as any);

      redisClient.on('connect', () => {
        logger.info('[REDIS] Connected successfully.');
      });

      redisClient.on('error', (err) => {
        if (!err.message.includes('ECONNREFUSED')) {
          logger.warn(`[REDIS] Connection warning: ${err.message}`);
        }
      });
    } catch (err: any) {
      logger.warn(`[REDIS] Failed to initialize: ${err.message}`);
      redisClient = null;
    }
  }

  return redisClient;
}

export async function checkRedisHealth(): Promise<{ status: string; latencyMs: number }> {
  if (redisConfig.disabled || !redisClient) {
    return { status: 'disabled', latencyMs: 0 };
  }
  const start = Date.now();
  try {
    const pong = await redisClient.ping();
    return { status: pong === 'PONG' ? 'healthy' : 'degraded', latencyMs: Date.now() - start };
  } catch {
    return { status: 'unhealthy', latencyMs: Date.now() - start };
  }
}

export async function closeRedis(): Promise<void> {
  if (redisClient) {
    try {
      await redisClient.quit();
      logger.info('[REDIS] Connection quit cleanly.');
    } catch {
      redisClient.disconnect();
    }
    redisClient = null;
  }
}

