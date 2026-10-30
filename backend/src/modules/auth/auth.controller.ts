/**
 * src/modules/auth/auth.controller.ts
 * Controller handling user authentication, Google SSO, and session termination.
 */

import { Request, Response, NextFunction } from 'express';
import { authService } from './auth.service';
import { sendSuccess } from '../../api/responses/apiResponse';
import { securityConfig } from '../../config/security';
import { BadRequestError } from '../../shared/errors';

export class AuthController {
  public async googleLogin(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { idToken } = req.body;
      if (!idToken) throw new BadRequestError('Google ID token is required.');

      const { user, sessionToken } = await authService.verifyGoogleLogin(idToken);

      res.cookie(securityConfig.cookie.name, sessionToken, {
        httpOnly: securityConfig.cookie.httpOnly,
        secure: securityConfig.cookie.secure,
        sameSite: securityConfig.cookie.sameSite,
        maxAge: securityConfig.cookie.maxAge,
        path: securityConfig.cookie.path,
      });

      sendSuccess(res, { user, sessionToken }, 'Google authentication successful.');
    } catch (err) {
      next(err);
    }
  }

  public async getSession(req: Request, res: Response): Promise<void> {
    sendSuccess(
      res,
      {
        authenticated: !!req.user,
        user: req.user || null,
      },
      'Active session retrieved.'
    );
  }

  public async logout(req: Request, res: Response): Promise<void> {
    res.clearCookie(securityConfig.cookie.name, {
      path: securityConfig.cookie.path,
    });
    sendSuccess(res, { loggedOut: true }, 'Signed out successfully.');
  }
}

export const authController = new AuthController();

