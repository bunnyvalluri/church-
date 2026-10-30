/**
 * src/types/auth.types.ts
 * Type definitions for KCM Church Role-Based Access Control and Authentication.
 */

export type UserRole =
  | 'SUPER_ADMIN'
  | 'ADMIN'
  | 'PASTOR'
  | 'EVENT_MANAGER'
  | 'FIELD_VOLUNTEER'
  | 'MEMBER'
  | 'NGO_ADMIN'
  | 'GUEST';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  branchId?: string | null;
  phone?: string | null;
}

export interface SessionTokenPayload {
  sessionId: string;
  userId: string;
  role: UserRole;
  branchId?: string | null;
  expiresAt: number;
}

export interface GoogleCredentialPayload {
  sub: string;
  email: string;
  email_verified: boolean;
  name: string;
  picture?: string;
  iss: string;
  aud: string;
}

