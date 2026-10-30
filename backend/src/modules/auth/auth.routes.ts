/**
 * src/modules/auth/auth.routes.ts
 * Express router for authentication routes.
 */

import { Router } from 'express';
import { authController } from './auth.controller';
import { authLimiter } from '../../api/middlewares/rateLimiter.middleware';
import { optionalAuthenticate } from '../../api/middlewares/auth.middleware';

const router = Router();

router.post('/google', authLimiter, (req, res, next) => authController.googleLogin(req, res, next));
router.get('/session', optionalAuthenticate, (req, res) => authController.getSession(req, res));
router.post('/logout', (req, res) => authController.logout(req, res));

export const authRoutes = router;

