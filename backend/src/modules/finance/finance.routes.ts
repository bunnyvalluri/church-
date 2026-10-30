/**
 * src/modules/finance/finance.routes.ts
 * Express router for Financial reports and reconciliation.
 */

import { Router } from 'express';
import { financeController } from './finance.controller';
import { authenticate } from '../../api/middlewares/auth.middleware';
import { requireRole } from '../../api/middlewares/rbac.middleware';

const router = Router();

router.get(
  '/summary',
  authenticate,
  requireRole('SUPER_ADMIN', 'ADMIN'),
  (req, res, next) => financeController.getSummary(req, res, next)
);

export const financeRoutes = router;

