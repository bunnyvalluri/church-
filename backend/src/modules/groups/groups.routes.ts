/**
 * src/modules/groups/groups.routes.ts
 * Express router for Small Groups.
 */

import { Router } from 'express';
import { groupsController } from './groups.controller';

const router = Router();

router.get('/', (req, res) => groupsController.listGroups(req, res));

export const groupsRoutes = router;

