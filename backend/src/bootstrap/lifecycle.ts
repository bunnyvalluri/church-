/**
 * src/bootstrap/lifecycle.ts
 * Graceful server startup and shutdown coordinator.
 */

import http from 'http';
import { disconnectPrisma } from '../infrastructure/prisma/client';
import { closeMongoClient } from '../infrastructure/mongodb/mongoClient';
import { closeRedis } from '../infrastructure/redis/client';
import { closeMediaWorker } from '../jobs/mediaWorker';
import { closeNotificationWorker } from '../jobs/notificationWorker';
import { logger } from '../shared/logger';

export function registerGracefulShutdown(server: http.Server): void {
  let isShuttingDown = false;

  const handleSignal = async (signal: string) => {
    if (isShuttingDown) return;
    isShuttingDown = true;

    logger.info(`\n[LIFECYCLE] Received ${signal}. Initiating graceful shutdown...`);

    // 1. Stop accepting new HTTP requests
    server.close(async () => {
      logger.info('[LIFECYCLE] HTTP server closed to new connections.');

      try {
        // 2. Terminate background workers
        await closeMediaWorker();
        await closeNotificationWorker();

        // 3. Disconnect persistence layers
        await closeRedis();
        await closeMongoClient();
        await disconnectPrisma();

        logger.info('[LIFECYCLE] All database and queue connections drained cleanly.');
        process.exit(0);
      } catch (err: any) {
        logger.error(`[LIFECYCLE] Error during resource cleanup: ${err.message}`);
        process.exit(1);
      }
    });

    // Forced exit safeguard after 10 seconds
    setTimeout(() => {
      logger.warn('[LIFECYCLE] Forceful termination timeout reached.');
      process.exit(1);
    }, 10000).unref();
  };

  process.on('SIGINT', () => handleSignal('SIGINT'));
  process.on('SIGTERM', () => handleSignal('SIGTERM'));

  process.on('uncaughtException', (err: Error) => {
    logger.error(`[UNCAUGHT_EXCEPTION] ${err.message}`, { stack: err.stack });
  });

  process.on('unhandledRejection', (reason: any) => {
    logger.error(`[UNHANDLED_REJECTION] ${reason?.message || reason}`);
  });
}
