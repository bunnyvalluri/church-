/**
 * src/modules/finance/finance.controller.ts
 * Controller for church financial reports.
 */

import { Request, Response, NextFunction } from 'express';
import { financeService } from './finance.service';
import { sendSuccess } from '../../api/responses/apiResponse';

export class FinanceController {
  public async getSummary(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { startDate, endDate } = req.query as { startDate?: string; endDate?: string };
      const summary = await financeService.getSummary(startDate, endDate);
      sendSuccess(res, summary, 'Financial summary calculated.');
    } catch (err) {
      next(err);
    }
  }
}

export const financeController = new FinanceController();

