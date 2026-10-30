/**
 * src/api/middlewares/rbac.middleware.ts
 * Role-Based Access Control and Branch-Scoped Permission Guards.
 */

import { Request, Response, NextFunction } from 'express';
import { UserRole } from '../../types/auth.types';
import { ForbiddenError, UnauthorizedError } from '../../shared/errors';

export function requireRole(...allowedRoles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(new UnauthorizedError('Authentication required'));
    }

    // SUPER_ADMIN and ADMIN have global override
    if (req.user.role === 'SUPER_ADMIN' || req.user.role === 'ADMIN') {
      return next();
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(
        new ForbiddenError(
          `Access denied. Role '${req.user.role}' is not authorized for this resource.`
        )
      );
    }

    next();
  };
}

export function requireBranchScope(branchParamName = 'branchId') {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(new UnauthorizedError('Authentication required'));
    }

    // Global roles can access all branches
    if (['SUPER_ADMIN', 'ADMIN'].includes(req.user.role)) {
      return next();
    }

    const targetBranchId = req.params[branchParamName] || req.body[branchParamName] || req.query[branchParamName];
    if (!targetBranchId) {
      return next();
    }

    if (req.user.branchId && req.user.branchId !== targetBranchId) {
      return next(
        new ForbiddenError('Access denied: You do not have permissions for this branch.')
      );
    }

    next();
  };
}

