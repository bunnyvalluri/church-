/**
 * src/modules/events/events.routes.ts
 * Express router for Church Events.
 */

import { Router } from 'express';
import { eventsController } from './events.controller';
import { authenticate } from '../../api/middlewares/auth.middleware';
import { requireRole } from '../../api/middlewares/rbac.middleware';

const router = Router();

router.get('/', (req, res, next) => eventsController.listEvents(req, res, next));
router.post(
  '/',
  authenticate,
  requireRole('SUPER_ADMIN', 'ADMIN', 'PASTOR', 'EVENT_MANAGER'),
  (req, res, next) => eventsController.createEvent(req, res, next)
);

export const eventsRoutes = router;

