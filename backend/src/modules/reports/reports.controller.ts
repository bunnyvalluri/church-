/**
 * src/modules/reports/reports.controller.ts
 * Controller for dashboard reports.
 */

import { Request, Response, NextFunction } from 'express';
import { reportsService } from './reports.service';
import { sendSuccess } from '../../api/responses/apiResponse';

export class ReportsController {
  public async getDashboard(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const overview = await reportsService.getDashboardOverview();
      sendSuccess(res, overview, 'Dashboard analytics retrieved.');
    } catch (err) {
      next(err);
    }
  }
}

export const reportsController = new ReportsController();

