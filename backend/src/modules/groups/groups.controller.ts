/**
 * src/modules/groups/groups.controller.ts
 * Controller for small groups directory.
 */

import { Request, Response } from 'express';
import { groupsService } from './groups.service';
import { sendSuccess } from '../../api/responses/apiResponse';

export class GroupsController {
  public listGroups(req: Request, res: Response): void {
    const groups = groupsService.getSmallGroups();
    sendSuccess(res, groups, 'Small groups retrieved.');
  }
}

export const groupsController = new GroupsController();

