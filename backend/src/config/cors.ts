/**
 * src/config/cors.ts
 * Whitelist-based Cross-Origin Resource Sharing configuration.
 */

export const ALLOWED_ORIGINS: string[] = [
  'https://kcmchurch.vercel.app',
  'https://church-valluri-rahuls-projects.vercel.app',
  'https://church-eight-hazel.vercel.app',
  'https://kcmchurch.org',
  'https://www.kcmchurch.org',
  'https://admin.kcmchurch.org',
  'https://pastor.kcmchurch.org',
  'https://member.kcmchurch.org',
  'https://ngo.kcmchurch.org',
  'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:3002',
  'http://127.0.0.1:3000',
];

export function isOriginAllowed(origin?: string | null): boolean {
  if (!origin) return true; // Server-to-server or non-browser tooling
  if (ALLOWED_ORIGINS.includes(origin)) return true;
  if (/^https:\/\/[a-z0-9-]+-valluri-rahuls-projects\.vercel\.app$/.test(origin)) return true;
  if (/^https:\/\/kcmchurch-[a-z0-9-]+\.vercel\.app$/.test(origin)) return true;
  return false;
}

