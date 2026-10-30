/**
 * src/modules/prayers/prayers.routes.ts
 * Express router for Prayer requests.
 */

import { Router } from 'express';
import { prayersController } from './prayers.controller';
import { optionalAuthenticate } from '../../api/middlewares/auth.middleware';

const router = Router();

router.get('/', optionalAuthenticate, (req, res, next) => prayersController.listPrayers(req, res, next));
router.post('/', optionalAuthenticate, (req, res, next) => prayersController.submitPrayer(req, res, next));

export const prayersRoutes = router;

