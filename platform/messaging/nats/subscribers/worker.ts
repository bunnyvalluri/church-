/**
 * Background Worker Service Entry Point for Kingdom of Christ Ministries
 * Demonstrates initialization of durable worker loops for Email, SMS, Push, and Media Processing
 */

import { NatsClientManager } from '../publishers/natsClient';
import { EventSubscriber } from './subscriber';

async function startWorkers() {
  const clientManager = NatsClientManager.getInstance();

  await clientManager.initialize({
    servers: (process.env.NATS_SERVERS || 'nats://nats.messaging.svc.cluster.local:4222').split(','),
    user: process.env.NATS_USER || 'kcm_api_service',
    password: process.env.NATS_PASSWORD,
  });

  const subscriber = new EventSubscriber();

  // 1. Email Job Worker Group
  await subscriber.subscribeDurableConsumer(
    'KCM_NOTIFICATIONS_STREAM',
    'EMAIL_WORKER_GROUP',
    async (event, msg) => {
      console.log(`[Email Worker] Sending email for event: ${event.eventType}`, event.payload);
      // Simulate Email Service API Call (e.g. SendGrid / SMTP)
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
  );

  // 2. SMS Job Worker Group
  await subscriber.subscribeDurableConsumer(
    'KCM_NOTIFICATIONS_STREAM',
    'SMS_WORKER_GROUP',
    async (event, msg) => {
      console.log(`[SMS Worker] Sending SMS notification to: ${event.payload.phoneNumber}`);
      // Simulate SMS API Call (e.g. Twilio)
      await new Promise((resolve) => setTimeout(resolve, 300));
    }
  );

  // 3. Media Processing Transcoder Worker Group
  await subscriber.subscribeDurableConsumer(
    'KCM_MEDIA_STREAM',
    'MEDIA_TRANSCODER_GROUP',
    async (event, msg) => {
      console.log(`[Media Worker] Transcoding media file: ${event.payload.fileUrl}`);
      // Simulate heavy ffmpeg video processing
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }
  );

  console.log('All KCM Background Workers registered and listening for jobs...');
}

// Handle Graceful Shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received. Shutting down worker consumers...');
  await NatsClientManager.getInstance().close();
  process.exit(0);
});

startWorkers().catch((err) => {
  console.error('Fatal Error starting workers:', err);
  process.exit(1);
});
