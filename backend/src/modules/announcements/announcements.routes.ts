/**
 * src/modules/announcements/announcements.routes.ts
 * Express router for announcements.
 */

import { Router } from 'express';
import { announcementsController } from './announcements.controller';
import { authenticate } from '../../api/middlewares/auth.middleware';
import { requireRole } from '../../api/middlewares/rbac.middleware';

const router = Router();

router.get('/', (req, res) => announcementsController.list(req, res));
router.post(
  '/',
  authenticate,
  requireRole('SUPER_ADMIN', 'ADMIN', 'PASTOR'),
  (req, res, next) => announcementsController.create(req, res, next)
);

export const announcementsRoutes = router;

