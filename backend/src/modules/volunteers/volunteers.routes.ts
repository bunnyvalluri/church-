/**
 * src/modules/volunteers/volunteers.routes.ts
 * Express router for Volunteer ministry.
 */

import { Router } from 'express';
import { volunteersController } from './volunteers.controller';
import { authenticate } from '../../api/middlewares/auth.middleware';

const router = Router();

router.get('/departments', (req, res) => volunteersController.listDepartments(req, res));
router.post('/apply', authenticate, (req, res, next) => volunteersController.apply(req, res, next));

export const volunteersRoutes = router;

