/**
 * src/modules/sermons/sermons.controller.ts
 * Controller for sermon viewing.
 */

import { Request, Response, NextFunction } from 'express';
import { sermonsService } from './sermons.service';
import { sendPaginated, sendSuccess } from '../../api/responses/apiResponse';

export class SermonsController {
  public async listSermons(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await sermonsService.listSermons(req.query);
      sendPaginated(res, result, 'Sermons retrieved.');
    } catch (err) {
      next(err);
    }
  }

  public async getSermon(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const sermon = await sermonsService.getSermonById(req.params.id as string);
      sendSuccess(res, sermon, 'Sermon retrieved.');
    } catch (err) {
      next(err);
    }
  }
}

export const sermonsController = new SermonsController();
