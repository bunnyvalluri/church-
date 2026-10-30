/**
 * src/modules/sermons/sermons.routes.ts
 * Express router for church sermons.
 */

import { Router } from 'express';
import { sermonsController } from './sermons.controller';

const router = Router();

router.get('/', (req, res, next) => sermonsController.listSermons(req, res, next));
router.get('/:id', (req, res, next) => sermonsController.getSermon(req, res, next));

export const sermonsRoutes = router;

