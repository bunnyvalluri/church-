/**
 * src/modules/users/users.routes.ts
 * Express router for User operations.
 */

import { Router } from 'express';
import { usersController } from './users.controller';
import { authenticate } from '../../api/middlewares/auth.middleware';
import { requireRole } from '../../api/middlewares/rbac.middleware';

const router = Router();

router.get('/me', authenticate, (req, res, next) => usersController.getMe(req, res, next));
router.patch('/me', authenticate, (req, res, next) => usersController.updateMe(req, res, next));
router.patch('/:id/role', authenticate, requireRole('SUPER_ADMIN', 'ADMIN'), (req, res, next) =>
  usersController.changeRole(req, res, next)
);

export const usersRoutes = router;

