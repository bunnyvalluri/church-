/**
 * src/modules/users/users.controller.ts
 * Controller for user operations and administrative role changes.
 */

import { Request, Response, NextFunction } from 'express';
import { usersService } from './users.service';
import { sendSuccess } from '../../api/responses/apiResponse';
import { UnauthorizedError } from '../../shared/errors';

export class UsersController {
  public async getMe(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw new UnauthorizedError();
      const user = await usersService.getUserById(req.user.id);
      sendSuccess(res, user, 'Profile retrieved.');
    } catch (err) {
      next(err);
    }
  }

  public async updateMe(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw new UnauthorizedError();
      const updated = await usersService.updateUserProfile(req.user.id, req.body);
      sendSuccess(res, updated, 'Profile updated successfully.');
    } catch (err) {
      next(err);
    }
  }

  public async changeRole(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id as string;
      const { role } = req.body;
      const updated = await usersService.updateUserRole(id, role);
      sendSuccess(res, updated, `User role changed to ${role}.`);
    } catch (err) {
      next(err);
    }
  }
}

export const usersController = new UsersController();
