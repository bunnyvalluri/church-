/**
 * src/modules/members/members.routes.ts
 * Express router for Church Member directory.
 */

import { Router } from 'express';
import { membersController } from './members.controller';
import { authenticate } from '../../api/middlewares/auth.middleware';
import { requireRole } from '../../api/middlewares/rbac.middleware';

const router = Router();

router.get('/', authenticate, requireRole('SUPER_ADMIN', 'ADMIN', 'PASTOR'), (req, res, next) =>
  membersController.listMembers(req, res, next)
);

export const membersRoutes = router;

