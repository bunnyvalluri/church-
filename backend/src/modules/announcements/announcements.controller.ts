/**
 * src/modules/announcements/announcements.controller.ts
 * Controller for announcements.
 */

import { Request, Response, NextFunction } from 'express';
import { announcementsService } from './announcements.service';
import { sendSuccess } from '../../api/responses/apiResponse';

export class AnnouncementsController {
  public list(req: Request, res: Response): void {
    const { branchId } = req.query as { branchId?: string };
    const items = announcementsService.getAnnouncements(branchId);
    sendSuccess(res, items, 'Announcements retrieved.');
  }

  public async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const record = await announcementsService.createAnnouncement(req.body);
      sendSuccess(res, record, 'Announcement created successfully.', 201);
    } catch (err) {
      next(err);
    }
  }
}

export const announcementsController = new AnnouncementsController();

