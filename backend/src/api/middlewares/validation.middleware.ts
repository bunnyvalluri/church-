/**
 * src/api/middlewares/validation.middleware.ts
 * Server-side input validation and parameter sanitization middleware.
 */

import { Request, Response, NextFunction } from 'express';
import { ValidationError } from '../../shared/errors';

export type ValidatorFn = (data: any) => { isValid: boolean; errors?: string[] };

export function validateBody(validator: ValidatorFn) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = validator(req.body);
    if (!result.isValid) {
      return next(new ValidationError('Invalid request body payload', result.errors));
    }
    next();
  };
}

export function validateQuery(validator: ValidatorFn) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = validator(req.query);
    if (!result.isValid) {
      return next(new ValidationError('Invalid query parameters', result.errors));
    }
    next();
  };
}

