/**
 * src/config/redis.ts
 * Redis connection configuration with TLS / Upstash auto-detection.
 */

import { env } from './env';

export const redisConfig = {
  url: env.REDIS_URL,
  disabled: env.DISABLE_BULLMQ,
  options: {
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
    retryStrategy(times: number) {
      if (times > 3) {
        return null; // Stop retrying after 3 attempts in development/offline
      }
      return Math.min(times * 500, 2000);
    },
    tls: env.REDIS_URL.startsWith('rediss://') ? { rejectUnauthorized: false } : undefined,
  },
};

