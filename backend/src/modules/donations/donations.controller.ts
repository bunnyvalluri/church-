/**
 * src/modules/donations/donations.controller.ts
 * Controller for donations and Razorpay checkout.
 */

import { Request, Response, NextFunction } from 'express';
import { donationsService } from './donations.service';
import { sendSuccess } from '../../api/responses/apiResponse';

export class DonationsController {
  public async createOrder(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const order = await donationsService.createOrder(req.body, req.user?.id);
      sendSuccess(res, order, 'Razorpay order created successfully.');
    } catch (err) {
      next(err);
    }
  }

  public async verifyDonation(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await donationsService.verifyDonation(req.body);
      sendSuccess(res, result, 'Donation payment verified successfully.');
    } catch (err) {
      next(err);
    }
  }
}

export const donationsController = new DonationsController();

