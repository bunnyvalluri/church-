/**
 * src/modules/branches/branches.controller.ts
 * Controller for branch campuses.
 */

import { Request, Response, NextFunction } from 'express';
import { branchesService } from './branches.service';
import { sendSuccess } from '../../api/responses/apiResponse';

export class BranchesController {
  public listBranches(req: Request, res: Response): void {
    const branches = branchesService.getAllBranches();
    sendSuccess(res, branches, 'Branches retrieved.');
  }

  public getBranch(req: Request, res: Response, next: NextFunction): void {
    try {
      const branch = branchesService.getBranchById(req.params.id as string);
      sendSuccess(res, branch, 'Branch retrieved.');
    } catch (err) {
      next(err);
    }
  }
}

export const branchesController = new BranchesController();
