/**
 * src/modules/offline-sync/offlineSync.routes.ts
 * Express router for offline mutations sync.
 */

import { Router } from 'express';
import { offlineSyncController } from './offlineSync.controller';
import { optionalAuthenticate } from '../../api/middlewares/auth.middleware';

const router = Router();

router.post('/push', optionalAuthenticate, (req, res, next) =>
  offlineSyncController.pushBatch(req, res, next)
);

export const offlineSyncRoutes = router;

