/**
 * src/modules/reports/reports.routes.ts
 * Express router for analytics reports.
 */

import { Router } from 'express';
import { reportsController } from './reports.controller';
import { authenticate } from '../../api/middlewares/auth.middleware';
import { requireRole } from '../../api/middlewares/rbac.middleware';

const router = Router();

router.get(
  '/dashboard',
  authenticate,
  requireRole('SUPER_ADMIN', 'ADMIN', 'PASTOR'),
  (req, res, next) => reportsController.getDashboard(req, res, next)
);

export const reportsRoutes = router;

