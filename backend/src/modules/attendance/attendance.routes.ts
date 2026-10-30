/**
 * src/modules/attendance/attendance.routes.ts
 * Express router for Church attendance tracking.
 */

import { Router } from 'express';
import { attendanceController } from './attendance.controller';
import { authenticate } from '../../api/middlewares/auth.middleware';
import { requireRole } from '../../api/middlewares/rbac.middleware';

const router = Router();

router.post('/check-in', authenticate, (req, res, next) => attendanceController.checkIn(req, res, next));
router.get(
  '/event/:eventId',
  authenticate,
  requireRole('SUPER_ADMIN', 'ADMIN', 'PASTOR', 'EVENT_MANAGER'),
  (req, res, next) => attendanceController.getAttendance(req, res, next)
);

export const attendanceRoutes = router;

