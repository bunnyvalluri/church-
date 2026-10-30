/**
 * src/bootstrap/server.ts
 * HTTP & Real-time Server Orchestrator and Port Listener.
 */

import http from 'http';
import { createExpressApp } from './app';
import { initializeSocketIO } from '../realtime/socketServer';
import { initializeMediaWorker } from '../jobs/mediaWorker';
import { initializeNotificationWorker } from '../jobs/notificationWorker';
import { registerGracefulShutdown } from './lifecycle';
import { env } from '../config/env';
import { logger } from '../shared/logger';

export function startServer(basePort = env.PORT, attempt = 0): http.Server {
  if (attempt > 5) {
    logger.error('[SERVER] Could not find an available port after 5 attempts. Exiting.');
    process.exit(1);
  }

  const app = createExpressApp();
  const server = http.createServer(app);

  // Initialize Real-time Socket.IO
  if (env.PROCESS_TYPE === 'all' || env.PROCESS_TYPE === 'socket' || env.PROCESS_TYPE === 'api') {
    initializeSocketIO(server);
  }

  // Initialize BullMQ background workers
  if (!env.DISABLE_BULLMQ && (env.PROCESS_TYPE === 'all' || env.PROCESS_TYPE === 'worker')) {
    initializeMediaWorker();
    initializeNotificationWorker();
  }

  // Register Graceful Shutdown hooks
  registerGracefulShutdown(server);

  server
    .listen(basePort, '0.0.0.0')
    .once('listening', () => {
      const address = server.address();
      const actualPort = typeof address === 'object' && address ? address.port : basePort;
      logger.info('====================================================');
      logger.info(`🚀 KCM Church Production Backend (${env.PROCESS_TYPE})`);
      logger.info(`📡 Listening on http://0.0.0.0:${actualPort}`);
      logger.info(`🔒 Security: Zero-Trust RBAC & HMAC Webhooks Active`);
      logger.info(`⚡ Node.js LTS Environment: ${env.NODE_ENV}`);
      logger.info('====================================================');
    })
    .once('error', (err: any) => {
      if (err.code === 'EADDRINUSE') {
        const nextPort = basePort + 1;
        logger.warn(`[SERVER] Port ${basePort} in use, trying ${nextPort}...`);
        server.removeAllListeners('error');
        server.removeAllListeners('listening');
        startServer(nextPort, attempt + 1);
      } else {
        logger.error(`[SERVER] Fatal listen error: ${err.message}`);
        process.exit(1);
      }
    });

  return server;
}

if (require.main === module) {
  startServer();
}

