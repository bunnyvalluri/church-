/**
 * src/modules/administration/admin.controller.ts
 * Controller for system administration.
 */

import { Request, Response, NextFunction } from 'express';
import { adminService } from './admin.service';
import { sendSuccess } from '../../api/responses/apiResponse';

export class AdminController {
  public async getDiagnostics(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const diagnostics = await adminService.getSystemDiagnostics();
      sendSuccess(res, diagnostics, 'System diagnostics retrieved.');
    } catch (err) {
      next(err);
    }
  }
}

export const adminController = new AdminController();

