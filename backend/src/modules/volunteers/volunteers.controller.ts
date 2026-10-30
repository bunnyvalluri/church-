/**
 * src/modules/volunteers/volunteers.controller.ts
 * Controller for volunteer departments and signups.
 */

import { Request, Response, NextFunction } from 'express';
import { volunteersService } from './volunteers.service';
import { sendSuccess } from '../../api/responses/apiResponse';

export class VolunteersController {
  public listDepartments(req: Request, res: Response): void {
    const depts = volunteersService.getDepartments();
    sendSuccess(res, depts, 'Volunteer departments retrieved.');
  }

  public async apply(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { departmentId, notes } = req.body;
      const userId = req.user?.id || 'guest_user';
      const application = await volunteersService.apply(userId, departmentId, notes);
      sendSuccess(res, application, 'Volunteer application submitted successfully.', 201);
    } catch (err) {
      next(err);
    }
  }
}

export const volunteersController = new VolunteersController();

