/**
 * src/modules/ngo/ngo.routes.ts
 * Express router for NGO charity and community programs.
 */

import { Router } from 'express';
import { ngoController } from './ngo.controller';

const router = Router();

router.get('/projects', (req, res) => ngoController.listProjects(req, res));
router.get('/stats', (req, res) => ngoController.getStats(req, res));

export const ngoRoutes = router;

