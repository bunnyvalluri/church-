/**
 * src/modules/audit-logs/auditLogs.controller.ts
 * Controller for security and data change audit logs.
 */

import { Request, Response, NextFunction } from 'express';
import { auditLogsService } from './auditLogs.service';
import { sendPaginated } from '../../api/responses/apiResponse';

export class AuditLogsController {
  public async listLogs(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await auditLogsService.listAuditLogs(req.query);
      sendPaginated(res, result, 'Audit logs retrieved.');
    } catch (err) {
      next(err);
    }
  }
}

export const auditLogsController = new AuditLogsController();

