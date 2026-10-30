/**
 * src/modules/notifications/notifications.controller.ts
 * Controller for device token registrations and notification dispatches.
 */

import { Request, Response, NextFunction } from 'express';
import { notificationsService } from './notifications.service';
import { sendSuccess } from '../../api/responses/apiResponse';
import { BadRequestError } from '../../shared/errors';

export class NotificationsController {
  public async registerToken(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { token, platform } = req.body;
      const userId = req.user?.id || req.body.userId || 'guest';
      if (!token) throw new BadRequestError('Device token is required.');

      const record = await notificationsService.registerDeviceToken(userId, token, platform);
      sendSuccess(res, record, 'Device token registered successfully.');
    } catch (err) {
      next(err);
    }
  }

  public async broadcast(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { title, body, data } = req.body;
      if (!title || !body) throw new BadRequestError('Title and body are required.');

      const result = await notificationsService.broadcastNotification(title, body, data);
      sendSuccess(res, result, 'Notification broadcast queued.');
    } catch (err) {
      next(err);
    }
  }
}

export const notificationsController = new NotificationsController();

