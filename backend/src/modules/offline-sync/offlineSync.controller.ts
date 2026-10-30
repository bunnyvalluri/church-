/**
 * src/modules/offline-sync/offlineSync.controller.ts
 * Controller for PWA offline data synchronization.
 */

import { Request, Response, NextFunction } from 'express';
import { offlineSyncService } from './offlineSync.service';
import { sendSuccess } from '../../api/responses/apiResponse';

export class OfflineSyncController {
  public async pushBatch(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.id || 'guest_device';
      const result = await offlineSyncService.processSyncBatch(req.body, userId);
      sendSuccess(res, result, 'Offline mutations synchronized.');
    } catch (err) {
      next(err);
    }
  }
}

export const offlineSyncController = new OfflineSyncController();

