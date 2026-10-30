/**
 * src/modules/members/members.controller.ts
 * Controller for member queries.
 */

import { Request, Response, NextFunction } from 'express';
import { membersService } from './members.service';
import { sendPaginated, sendSuccess } from '../../api/responses/apiResponse';

export class MembersController {
  public async listMembers(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await membersService.listMembers(req.query as any);
      sendPaginated(res, result, 'Members list retrieved.');
    } catch (err) {
      next(err);
    }
  }
}

export const membersController = new MembersController();

