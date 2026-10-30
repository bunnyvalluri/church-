/**
 * src/shared/constants.ts
 * Enterprise constants for KCM Church platform.
 */

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  ACCEPTED: 202,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
} as const;

export const USER_ROLES = {
  SUPER_ADMIN: 'SUPER_ADMIN',
  ADMIN: 'ADMIN',
  PASTOR: 'PASTOR',
  EVENT_MANAGER: 'EVENT_MANAGER',
  FIELD_VOLUNTEER: 'FIELD_VOLUNTEER',
  MEMBER: 'MEMBER',
  NGO_ADMIN: 'NGO_ADMIN',
  GUEST: 'GUEST',
} as const;

export const HYDERABAD_BRANCHES = [
  { id: 'branch_kukatpally', name: 'KCM Kukatpally (Main Campus)', slug: 'kukatpally', city: 'Hyderabad' },
  { id: 'branch_banjara_hills', name: 'KCM Banjara Hills', slug: 'banjara-hills', city: 'Hyderabad' },
  { id: 'branch_secunderabad', name: 'KCM Secunderabad', slug: 'secunderabad', city: 'Secunderabad' },
] as const;

export const QUEUES = {
  MEDIA_UPLOADS: 'media-uploads',
  NOTIFICATIONS: 'notifications-dispatch',
  DONATION_SYNC: 'donation-sync',
  OFFLINE_MUTATIONS: 'offline-mutations',
} as const;

export const SESSION_COOKIE_NAME = 'kcm_session';

