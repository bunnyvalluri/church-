/**
 * frontend/tests/route-health/discovery/routeDiscovery.ts
 * Dynamic Route Discovery Utility.
 * Discovers Next.js App Router pages and APIs, plus Backend Express endpoints.
 */

import fs from 'fs';
import path from 'path';

export type RouteCategory =
  | 'PUBLIC'
  | 'AUTH'
  | 'MEMBER'
  | 'ADMIN'
  | 'PASTOR'
  | 'EVENT_MANAGER'
  | 'FIELD_VOLUNTEER'
  | 'NEXT_API'
  | 'BACKEND_API';

export interface DiscoveredRoute {
  path: string;
  category: RouteCategory;
  type: 'PAGE' | 'API';
  requiresAuth: boolean;
  expectedStatus: number;
  description: string;
  file?: string;
  method?: string;
}

export function categorizeRoute(routePath: string, type: 'PAGE' | 'API'): {
  category: RouteCategory;
  requiresAuth: boolean;
  expectedStatus: number;
} {
  if (type === 'API') {
    if (routePath.startsWith('/api/admin')) return { category: 'BACKEND_API', requiresAuth: true, expectedStatus: 401 };
    if (routePath.startsWith('/api/pastor')) return { category: 'BACKEND_API', requiresAuth: true, expectedStatus: 401 };
    if (routePath.startsWith('/api/member')) return { category: 'BACKEND_API', requiresAuth: true, expectedStatus: 401 };
    if (routePath.startsWith('/health')) return { category: 'BACKEND_API', requiresAuth: false, expectedStatus: 200 };
    return { category: 'NEXT_API', requiresAuth: false, expectedStatus: 200 };
  }

  // Frontend Pages
  if (routePath.startsWith('/admin')) {
    if (routePath === '/admin/login') return { category: 'AUTH', requiresAuth: false, expectedStatus: 200 };
    return { category: 'ADMIN', requiresAuth: true, expectedStatus: 302 }; // Redirect to /login
  }
  if (routePath.startsWith('/pastor')) {
    if (routePath === '/pastor/login') return { category: 'AUTH', requiresAuth: false, expectedStatus: 200 };
    return { category: 'PASTOR', requiresAuth: true, expectedStatus: 302 };
  }
  if (routePath.startsWith('/member') || routePath.startsWith('/church-member')) {
    return { category: 'MEMBER', requiresAuth: true, expectedStatus: 302 };
  }
  if (routePath.startsWith('/event-manager') || routePath.startsWith('/event-management')) {
    if (routePath === '/event-manager/login') return { category: 'AUTH', requiresAuth: false, expectedStatus: 200 };
    return { category: 'EVENT_MANAGER', requiresAuth: true, expectedStatus: 302 };
  }
  if (routePath.startsWith('/field-volunteer')) {
    return { category: 'FIELD_VOLUNTEER', requiresAuth: true, expectedStatus: 302 };
  }
  if (
    routePath === '/login' ||
    routePath === '/register' ||
    routePath === '/forgot-password' ||
    routePath === '/portal-select'
  ) {
    return { category: 'AUTH', requiresAuth: false, expectedStatus: 200 };
  }

  return { category: 'PUBLIC', requiresAuth: false, expectedStatus: 200 };
}

export function discoverAllRoutes(appDir: string = 'frontend/app'): DiscoveredRoute[] {
  const routes: DiscoveredRoute[] = [];

  function walk(dir: string, baseRoute: string = '') {
    if (!fs.existsSync(dir)) return;
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.isDirectory()) {
        const seg = entry.name;
        const subBase = seg.startsWith('(') && seg.endsWith(')') ? baseRoute : `${baseRoute}/${seg}`;
        walk(path.join(dir, seg), subBase);
      } else if (entry.name === 'page.tsx' || entry.name === 'page.jsx' || entry.name === 'page.js') {
        const p = baseRoute === '' ? '/' : baseRoute;
        const { category, requiresAuth, expectedStatus } = categorizeRoute(p, 'PAGE');
        routes.push({
          path: p,
          category,
          type: 'PAGE',
          requiresAuth,
          expectedStatus,
          description: `${category} Page: ${p}`,
          file: path.join(dir, entry.name),
        });
      } else if (entry.name === 'route.ts' || entry.name === 'route.js') {
        const p = baseRoute === '' ? '/' : baseRoute;
        const { category, requiresAuth, expectedStatus } = categorizeRoute(p, 'API');
        routes.push({
          path: p,
          category,
          type: 'API',
          requiresAuth,
          expectedStatus,
          description: `${category} Endpoint: ${p}`,
          file: path.join(dir, entry.name),
        });
      }
    }
  }

  walk(appDir);
  return routes;
}

