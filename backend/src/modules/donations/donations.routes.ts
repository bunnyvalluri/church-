/**
 * src/modules/donations/donations.routes.ts
 * Express router for donations.
 */

import { Router } from 'express';
import { donationsController } from './donations.controller';
import { optionalAuthenticate } from '../../api/middlewares/auth.middleware';

const router = Router();

router.post('/create-order', optionalAuthenticate, (req, res, next) =>
  donationsController.createOrder(req, res, next)
);
router.post('/verify', (req, res, next) => donationsController.verifyDonation(req, res, next));

export const donationsRoutes = router;

