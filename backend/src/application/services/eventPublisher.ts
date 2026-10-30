/**
 * src/application/services/eventPublisher.ts
 * Real-time WebSocket and Queue event publishing facade.
 */

import { addJob } from '../../infrastructure/bullmq/queueManager';
import { QUEUES } from '../../shared/constants';
import { logger } from '../../shared/logger';

export interface ChurchDomainEvent<T = any> {
  type: string;
  payload: T;
  room?: string;
  timestamp: string;
}

class EventPublisherFacade {
  private socketEmitter: any = null;

  public setSocketEmitter(emitter: any): void {
    this.socketEmitter = emitter;
  }

  public async publishRealtime<T = any>(type: string, payload: T, room?: string): Promise<void> {
    const event: ChurchDomainEvent<T> = {
      type,
      payload,
      room,
      timestamp: new Date().toISOString(),
    };

    logger.debug(`[EVENT_PUBLISHER] Emitting ${type} ${room ? `to room ${room}` : '(global)'}`);

    if (this.socketEmitter) {
      if (room) {
        this.socketEmitter.to(room).emit(type, payload);
      } else {
        this.socketEmitter.emit(type, payload);
      }
    }
  }

  public async enqueueNotification(data: any): Promise<boolean> {
    return addJob(QUEUES.NOTIFICATIONS, 'send-notification', data);
  }

  public async enqueueMediaOptimization(reportId: string, assetUrl: string): Promise<boolean> {
    return addJob(QUEUES.MEDIA_UPLOADS, 'optimize-media', { reportId, assetUrl });
  }

  public async enqueueDonationSync(donationId: string): Promise<boolean> {
    return addJob(QUEUES.DONATION_SYNC, 'reconcile-donation', { donationId });
  }
}

export const eventPublisher = new EventPublisherFacade();

