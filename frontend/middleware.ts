/**
 * middleware.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Next.js Edge Middleware — Centralized route protection and role-based access.
 *
 * Role Matrix:
 *  SUPER_ADMIN  → /admin/*, /pastor/main/*, /member/*
 *  ADMIN        → /admin/*, /pastor/main/*, /member/*
 *  PASTOR       → /pastor/main/*, /member/*
 *  MEMBER       → /member/* only
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { NextRequest, NextResponse } from 'next/server';

// ── Role Protected Prefixes ──────────────────────────────────────────────────
const ADMIN_PREFIXES = ['/admin'];
const PASTOR_PREFIXES = ['/pastor'];
const EVENT_MANAGER_PREFIXES = ['/event-manager'];
const FIELD_VOLUNTEER_PREFIXES = ['/field-volunteer'];
const MEMBER_PREFIXES = ['/member', '/church-member', '/memberships'];

// ── API Protected Prefixes ───────────────────────────────────────────────────
const ADMIN_API_PREFIXES = ['/api/admin'];
const PASTOR_API_PREFIXES = ['/api/pastor'];
const EVENT_MANAGER_API_PREFIXES = ['/api/event-manager'];
const FIELD_VOLUNTEER_API_PREFIXES = ['/api/field-volunteer'];

// ── Public Paths ─────────────────────────────────────────────────────────────
const PUBLIC_PATHS = [
  '/login',
  '/register',
  '/forgot-password',
  '/admin/login',
  '/admin/register',
  '/api/auth',
  '/api/member/profile',
  '/api/donations',
  '/api/sermons',
  '/api/events',
  '/api/contact',
  '/api/cms',
  '/api/health',
  '/api/ready',
  '/_next',
  '/favicon',
  '/apple-icon',
  '/icon',
  '/sitemap',
  '/robots',
];

function isPublicPath(pathname: string): boolean {
  return PUBLIC_PATHS.some(
    (p) => pathname === p || pathname.startsWith(p + '/') || pathname.startsWith(p + '?')
  );
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // ── HTTPS Enforcement in Production ──────────────────────────────────────
  const isProd = process.env.NODE_ENV === 'production';
  const proto = req.headers.get('x-forwarded-proto');
  if (isProd && proto && proto !== 'https') {
    const httpsUrl = req.nextUrl.clone();
    httpsUrl.protocol = 'https:';
    return NextResponse.redirect(httpsUrl, 301);
  }

  // Always allow static files & next internals
  if (pathname.startsWith('/_next/') || pathname.includes('.')) {
    return NextResponse.next();
  }

  // ── Check Session Presence via Cookies ───────────────────────────────────
  const sessionRole = req.cookies.get('__kcm_session_role')?.value?.toUpperCase() ?? null;
  const sessionUid  = req.cookies.get('__kcm_session_uid')?.value ?? null;
  const hasSession  = !!(sessionUid && sessionRole);

  const effectiveRole = hasSession ? sessionRole : null;
  const isAuthenticated = !!effectiveRole;
  const isSuperAdmin    = effectiveRole === 'SUPER_ADMIN';
  const isAdminRole     = effectiveRole === 'ADMIN' || isSuperAdmin;
  const isPastorRole    = effectiveRole === 'PASTOR' || isAdminRole;
  const isEventManagerRole = effectiveRole === 'EVENT_MANAGER' || isAdminRole;
  const isVolunteerRole = effectiveRole === 'FIELD_VOLUNTEER' || isEventManagerRole;

  // ── Helper: redirect unauthenticated to login ───────────────────────────
  function redirectToLogin(next?: string) {
    const loginUrl = req.nextUrl.clone();
    loginUrl.pathname = '/login';
    if (next && next !== '/' && next !== '/login' && next !== '/register') {
      loginUrl.searchParams.set('next', next);
    }
    return NextResponse.redirect(loginUrl);
  }

  // ── Helper: redirect authenticated user to their authorized portal ──────
  function redirectToAuthorizedPortal() {
    const portalUrl = req.nextUrl.clone();
    if (isAdminRole) {
      portalUrl.pathname = '/admin/dashboard';
    } else if (effectiveRole === 'PASTOR') {
      portalUrl.pathname = '/pastor/main/dashboard';
    } else if (isVolunteerRole) {
      portalUrl.pathname = '/event-manager';
    } else {
      portalUrl.pathname = '/member';
    }
    return NextResponse.redirect(portalUrl);
  }

  // ── Logged-In User Redirects on /login and /register ──────────────────────
  if (isAuthenticated && (pathname === '/login' || pathname === '/register')) {
    const nextParam = req.nextUrl.searchParams.get('next');
    // If next is specified and user has permission, let them proceed
    if (nextParam && nextParam.startsWith('/')) {
      if (nextParam.startsWith('/admin') && isAdminRole) return NextResponse.redirect(new URL(nextParam, req.url));
      if (nextParam.startsWith('/pastor') && isPastorRole) return NextResponse.redirect(new URL(nextParam, req.url));
      if (nextParam.startsWith('/member')) return NextResponse.redirect(new URL(nextParam, req.url));
    }
    return redirectToAuthorizedPortal();
  }

  // If public path, allow through
  if (isPublicPath(pathname)) {
    return NextResponse.next();
  }

  // ── Root /pastor redirect ────────────────────────────────────────────────
  if (pathname === '/pastor' || pathname === '/pastor/') {
    if (!isAuthenticated) return redirectToLogin('/pastor/main/dashboard');
    if (!isPastorRole) return redirectToAuthorizedPortal();
    const target = req.nextUrl.clone();
    target.pathname = '/pastor/main/dashboard';
    return NextResponse.redirect(target);
  }

  // ── Root /admin redirect ─────────────────────────────────────────────────
  if (pathname === '/admin' || pathname === '/admin/') {
    if (!isAuthenticated) return redirectToLogin('/admin/dashboard');
    if (!isAdminRole) return redirectToAuthorizedPortal();
    const target = req.nextUrl.clone();
    target.pathname = '/admin/dashboard';
    return NextResponse.redirect(target);
  }

  // ── Guard: /admin/* pages ─────────────────────────────────────────────────
  if (ADMIN_PREFIXES.some((p) => pathname === p || pathname.startsWith(p + '/'))) {
    if (!isAuthenticated) return redirectToLogin(pathname);
    if (!isAdminRole) return redirectToAuthorizedPortal();
    return NextResponse.next();
  }

  // ── Guard: /pastor/* pages ────────────────────────────────────────────────
  if (PASTOR_PREFIXES.some((p) => pathname === p || pathname.startsWith(p + '/'))) {
    if (!isAuthenticated) return redirectToLogin(pathname);
    if (!isPastorRole) return redirectToAuthorizedPortal();
    return NextResponse.next();
  }

  // ── Guard: /event-manager/* pages ──────────────────────────────────────────
  if (EVENT_MANAGER_PREFIXES.some((p) => pathname === p || pathname.startsWith(p + '/'))) {
    if (!isAuthenticated) return redirectToLogin(pathname);
    if (!isVolunteerRole) return redirectToAuthorizedPortal();
    return NextResponse.next();
  }

  // ── Guard: /field-volunteer/* pages ────────────────────────────────────────
  if (FIELD_VOLUNTEER_PREFIXES.some((p) => pathname === p || pathname.startsWith(p + '/'))) {
    if (!isAuthenticated) return redirectToLogin(pathname);
    if (!isVolunteerRole) return redirectToAuthorizedPortal();
    return NextResponse.next();
  }

  // ── Guard: /member/* pages ────────────────────────────────────────────────
  if (MEMBER_PREFIXES.some((p) => pathname === p || pathname.startsWith(p + '/'))) {
    if (!isAuthenticated) return redirectToLogin(pathname);
    return NextResponse.next();
  }

  // ── Guard: /api/admin/* endpoints ─────────────────────────────────────────
  if (ADMIN_API_PREFIXES.some((p) => pathname.startsWith(p))) {
    if (!isAuthenticated) {
      return NextResponse.json({ error: 'Authentication required. Please sign in.' }, { status: 401 });
    }
    if (!isAdminRole) {
      return NextResponse.json({ error: 'Access denied. Admin privileges required.' }, { status: 403 });
    }
    return NextResponse.next();
  }

  // ── Guard: /api/pastor/* endpoints ────────────────────────────────────────
  if (PASTOR_API_PREFIXES.some((p) => pathname.startsWith(p))) {
    const isGetSermons = req.method === 'GET' && pathname.startsWith('/api/pastor/sermons');
    if (!isGetSermons) {
      if (!isAuthenticated) {
        return NextResponse.json({ error: 'Authentication required. Please sign in.' }, { status: 401 });
      }
      const isSermonEndpoint = pathname.startsWith('/api/pastor/sermons') || pathname.startsWith('/api/pastor/clear-seeded-sermons');
      const canAccess = isPastorRole || (isSermonEndpoint && isVolunteerRole);
      if (!canAccess) {
        return NextResponse.json({ error: 'Access denied. Pastor or Admin privileges required.' }, { status: 403 });
      }
    }
    return NextResponse.next();
  }

  // ── Guard: /api/event-manager/* endpoints ──────────────────────────────────
  if (EVENT_MANAGER_API_PREFIXES.some((p) => pathname.startsWith(p))) {
    if (!isAuthenticated) {
      return NextResponse.json({ error: 'Authentication required. Please sign in.' }, { status: 401 });
    }
    if (!isVolunteerRole) {
      return NextResponse.json({ error: 'Access denied. Event Management privileges required.' }, { status: 403 });
    }
    return NextResponse.next();
  }

  // ── Guard: /api/field-volunteer/* endpoints ─────────────────────────────────
  if (FIELD_VOLUNTEER_API_PREFIXES.some((p) => pathname.startsWith(p))) {
    if (!isAuthenticated) {
      return NextResponse.json({ error: 'Authentication required. Please sign in.' }, { status: 401 });
    }
    if (!isVolunteerRole) {
      return NextResponse.json({ error: 'Access denied. Volunteer privileges required.' }, { status: 403 });
    }
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths EXCEPT:
     * - _next/static (static files)
     * - _next/image  (image optimisation)
     * - favicon.ico
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
