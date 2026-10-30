/**
 * src/modules/prayers/prayers.controller.ts
 * Controller for prayer request submission and wall viewing.
 */

import { Request, Response, NextFunction } from 'express';
import { prayersService } from './prayers.service';
import { sendSuccess, sendPaginated } from '../../api/responses/apiResponse';

export class PrayersController {
  public async submitPrayer(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const prayer = await prayersService.submitPrayer(req.body, req.user?.id);
      sendSuccess(res, prayer, 'Prayer request submitted successfully.', 201);
    } catch (err) {
      next(err);
    }
  }

  public async listPrayers(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await prayersService.listPrayers(req.query, req.user?.role);
      sendPaginated(res, result, 'Prayer requests retrieved.');
    } catch (err) {
      next(err);
    }
  }
}

export const prayersController = new PrayersController();

