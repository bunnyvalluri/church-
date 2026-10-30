/**
 * src/modules/notifications/notifications.routes.ts
 * Express router for multi-channel notifications.
 */

import { Router } from 'express';
import { notificationsController } from './notifications.controller';
import { authenticate, optionalAuthenticate } from '../../api/middlewares/auth.middleware';
import { requireRole } from '../../api/middlewares/rbac.middleware';
import { notificationLimiter } from '../../api/middlewares/rateLimiter.middleware';

const router = Router();

router.post('/device-token', optionalAuthenticate, (req, res, next) =>
  notificationsController.registerToken(req, res, next)
);
router.post(
  '/broadcast',
  authenticate,
  requireRole('SUPER_ADMIN', 'ADMIN', 'PASTOR'),
  notificationLimiter,
  (req, res, next) => notificationsController.broadcast(req, res, next)
);

export const notificationsRoutes = router;

