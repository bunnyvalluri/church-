/**
 * src/modules/audit-logs/auditLogs.routes.ts
 * Express router for audit logs inspection.
 */

import { Router } from 'express';
import { auditLogsController } from './auditLogs.controller';
import { authenticate } from '../../api/middlewares/auth.middleware';
import { requireRole } from '../../api/middlewares/rbac.middleware';

const router = Router();

router.get(
  '/',
  authenticate,
  requireRole('SUPER_ADMIN', 'ADMIN'),
  (req, res, next) => auditLogsController.listLogs(req, res, next)
);

export const auditLogsRoutes = router;

