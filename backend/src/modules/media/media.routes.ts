/**
 * src/modules/media/media.routes.ts
 * Express router for Cloudinary media uploads.
 */

import { Router } from 'express';
import { mediaController } from './media.controller';
import { authenticate } from '../../api/middlewares/auth.middleware';

const router = Router();

router.post('/sign-upload', authenticate, (req, res, next) => mediaController.signUpload(req, res, next));
router.post('/register', authenticate, (req, res, next) => mediaController.registerMedia(req, res, next));

export const mediaRoutes = router;

