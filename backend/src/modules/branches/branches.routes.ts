/**
 * src/modules/branches/branches.routes.ts
 * Express router for Church branch locations.
 */

import { Router } from 'express';
import { branchesController } from './branches.controller';

const router = Router();

router.get('/', (req, res) => branchesController.listBranches(req, res));
router.get('/:id', (req, res, next) => branchesController.getBranch(req, res, next));

export const branchesRoutes = router;

