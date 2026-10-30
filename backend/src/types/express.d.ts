/**
 * src/types/express.d.ts
 * Type augmentation for Express Request to include AuthUser and Request metadata.
 */

import { AuthUser } from './auth.types';

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
      id?: string;
      correlationId?: string;
      rawBody?: Buffer;
    }
  }
}

export {};

