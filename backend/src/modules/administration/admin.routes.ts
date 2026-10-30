/**
 * src/modules/administration/admin.routes.ts
 * Express router for Administration.
 */

import { Router } from 'express';
import { adminController } from './admin.controller';
import { authenticate } from '../../api/middlewares/auth.middleware';
import { requireRole } from '../../api/middlewares/rbac.middleware';

const router = Router();

router.get(
  '/diagnostics',
  authenticate,
  requireRole('SUPER_ADMIN', 'ADMIN'),
  (req, res, next) => adminController.getDiagnostics(req, res, next)
);

export const adminRoutes = router;

