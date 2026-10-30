/**
 * src/pwa/cache-policy.ts
 * PWA Caching strategy definitions and cache partitioning.
 */

export const CACHE_NAMES = {
  STATIC_SHELL: 'kcm-shell-v3',
  DYNAMIC_API: 'kcm-api-runtime-v3',
  MEDIA_ASSETS: 'kcm-media-v3',
} as const;

export const NEVER_CACHE_URLS = [
  '/api/auth',
  '/api/donations/create-order',
  '/api/donations/verify',
  '/api/admin',
  '/api/pastor',
  '/api/member',
];

export function isCacheableUrl(url: string): boolean {
  return !NEVER_CACHE_URLS.some((blocked) => url.includes(blocked));
}

