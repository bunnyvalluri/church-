/**
 * frontend/tests/pwa-service-worker.spec.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * PWA Service Worker Specification & Scheme Validation Test Suite
 * Validates:
 * 1. Protocol Scheme Filtering (rejects chrome-extension://, chrome://, data:, blob:, file:, about:)
 * 2. HTTP Method Handling (GET only, rejects POST/PUT/DELETE/OPTIONS)
 * 3. Cross-Origin Script Isolation (never cache third-party or extension scripts in static cache)
 * 4. Cache Versioning & Migration (kcm-static-v6, safe namespace pruning)
 * 5. Safe Cache Put Validation Logic
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { test, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

test.describe('PWA Service Worker Scheme & Caching Architecture', () => {
  const swPath = path.resolve(__dirname, '../public/sw.js');
  let swContent: string;

  test.beforeAll(() => {
    expect(fs.existsSync(swPath), 'sw.js must exist in frontend/public').toBe(true);
    swContent = fs.readFileSync(swPath, 'utf-8');
  });

  test('SW version is bumped to v6 for cache migration', () => {
    expect(swContent).toContain('const CACHE_VERSION = "v6";');
    expect(swContent).toContain('const STATIC_CACHE_NAME = `kcm-static-${CACHE_VERSION}`;');
    expect(swContent).toContain('const PUBLIC_CONTENT_CACHE = `kcm-public-content-${CACHE_VERSION}`;');
  });

  test('SW contains top-level protocol scheme filter rejecting non-http/https requests', () => {
    expect(swContent).toContain('url.protocol !== "http:" && url.protocol !== "https:"');
  });

  test('SW contains isCacheable helper rejecting non-http/https and non-GET requests', () => {
    expect(swContent).toContain('function isCacheable(request, response)');
    expect(swContent).toContain('request.method !== "GET"');
    expect(swContent).toContain('parsedUrl.protocol !== "http:" && parsedUrl.protocol !== "https:"');
    expect(swContent).toContain('response.status !== 200');
  });

  test('SW isolates script/stylesheet caching strictly to same-origin', () => {
    expect(swContent).toContain('isSameOrigin && url.pathname.match(/\\.(css|js)$/i)');
  });

  test('SW protects activate cache cleanup to only purge kcm- prefixed caches', () => {
    expect(swContent).toContain('name.startsWith("kcm-")');
    expect(swContent).toContain('!ALLOWED_CACHES.includes(name)');
  });

  test('Simulated scheme validation handles all unsupported browser schemes', () => {
    const isSupportedScheme = (rawUrl: string): boolean => {
      try {
        const url = new URL(rawUrl);
        return url.protocol === 'http:' || url.protocol === 'https:';
      } catch {
        return false;
      }
    };

    // Must REJECT all browser internal and extension schemes
    expect(isSupportedScheme('chrome-extension://nkbihfbeogaeaoehlefnkodbefgpgknn/contentscript.js')).toBe(false);
    expect(isSupportedScheme('chrome-extension://cjpalhdlnbpafiamejdnhcphjbkeiagm/js/contentscript.js')).toBe(false);
    expect(isSupportedScheme('moz-extension://a3f4e2-9b21-4a/script.js')).toBe(false);
    expect(isSupportedScheme('safari-extension://com.example/script.js')).toBe(false);
    expect(isSupportedScheme('chrome://settings/')).toBe(false);
    expect(isSupportedScheme('devtools://devtools/bundled/inspector.html')).toBe(false);
    expect(isSupportedScheme('data:text/javascript;base64,YWxlcnQoMSk=')).toBe(false);
    expect(isSupportedScheme('blob:https://kcmchurch.vercel.app/6b32-84df')).toBe(false);
    expect(isSupportedScheme('file:///C:/test.js')).toBe(false);
    expect(isSupportedScheme('about:blank')).toBe(false);

    // Must ALLOW legitimate web requests
    expect(isSupportedScheme('https://kcmchurch.vercel.app/_next/static/chunks/main.js')).toBe(true);
    expect(isSupportedScheme('http://localhost:3000/offline')).toBe(true);
    expect(isSupportedScheme('https://images.unsplash.com/photo-1')).toBe(true);
  });
});
