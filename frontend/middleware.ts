/**
 * middleware.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Next.js Edge Middleware — Production-Ready Route Protection, Role-Based
 * Access Control, Cryptographic Session Verification, and CSRF Defense.
 *
 * Role Matrix:
 *  SUPER_ADMIN     → /admin/*, /pastor/*, /member/*, /event-manager/*
 *  ADMIN           → /admin/*, /pastor/*, /member/*, /event-manager/*
 *  PASTOR          → /pastor/*, /member/*
 *  EVENT_MANAGER   → /event-manager/*, /member/*
 *  FIELD_VOLUNTEER → /field-volunteer/*, /event-manager/*, /member/*
 *  MEMBER          → /member/* only
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { NextRequest, NextResponse } from 'next/server';
import { verifySessionAtEdge, SESSION_COOKIE_NAME } from '@/lib/edgeSession';

// ── Role Protected Prefixes ──────────────────────────────────────────────────
const ADMIN_PREFIXES = ['/admin'];
const PASTOR_PREFIXES = ['/pastor'];
const EVENT_MANAGER_PREFIXES = ['/event-manager', '/event-management'];
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

// ── Webhook Exemptions for CSRF ──────────────────────────────────────────────
const WEBHOOK_PREFIXES = [
  '/api/donations/stripe/webhook',
  '/api/payments/webhook',
  '/api/webhooks/httpsms',
  '/api/google-event-trigger',
  '/api/donations/test-webhook',
];

function isPublicPath(pathname: string): boolean {
  return PUBLIC_PATHS.some(
    (p) => pathname === p || pathname.startsWith(p + '/') || pathname.startsWith(p + '?')
  );
}

function isWebhookPath(pathname: string): boolean {
  return WEBHOOK_PREFIXES.some((w) => pathname.startsWith(w));
}

export async function middleware(req: NextRequest) {
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

  // ── CSRF Protection on State-Changing API Requests ─────────────────────────
  const method = req.method.toUpperCase();
  const isStateChanging = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method);

  if (isStateChanging && pathname.startsWith('/api/') && !isWebhookPath(pathname)) {
    const origin = req.headers.get('origin');
    const referer = req.headers.get('referer');
    const host = req.headers.get('host') || req.nextUrl.host;

    if (origin) {
      try {
        const originUrl = new URL(origin);
        const originHost = originUrl.host;
        // Allow match on exact host or allowed staging/prod hosts
        const isAllowedOrigin =
          originHost === host ||
          originHost === 'kcmchurch.vercel.app' ||
          originHost.endsWith('.vercel.app') ||
          originHost.startsWith('localhost') ||
          originHost.startsWith('127.0.0.1');

        if (!isAllowedOrigin) {
          return NextResponse.json(
            { error: 'Forbidden: Cross-site request forgery protection triggered.' },
            { status: 403 }
          );
        }
      } catch {
        return NextResponse.json(
          { error: 'Forbidden: Malformed request origin.' },
          { status: 403 }
        );
      }
    } else if (referer) {
      try {
        const refererUrl = new URL(referer);
        const refererHost = refererUrl.host;
        const isAllowedReferer =
          refererHost === host ||
          refererHost === 'kcmchurch.vercel.app' ||
          refererHost.endsWith('.vercel.app') ||
          refererHost.startsWith('localhost') ||
          refererHost.startsWith('127.0.0.1');

        if (!isAllowedReferer) {
          return NextResponse.json(
            { error: 'Forbidden: Cross-site request forgery protection triggered.' },
            { status: 403 }
          );
        }
      } catch {
        // Ignored if unparseable referer
      }
    }
  }

  // ── Cryptographic Session Verification via Edge Web Crypto ────────────────
  const sessionCookie = req.cookies.get(SESSION_COOKIE_NAME)?.value || null;
  const verifiedSession = await verifySessionAtEdge(sessionCookie);

  const effectiveRole = verifiedSession?.role ?? null;
  const isAuthenticated = !!effectiveRole;
  const isSuperAdmin = effectiveRole === 'SUPER_ADMIN';
  const isAdminRole = effectiveRole === 'ADMIN' || isSuperAdmin;
  const isPastorRole = effectiveRole === 'PASTOR' || isAdminRole;
  const isEventManagerRole = effectiveRole === 'EVENT_MANAGER' || isAdminRole;
  const isVolunteerRole = effectiveRole === 'FIELD_VOLUNTEER' || isEventManagerRole;

  // ── Helper: redirect unauthenticated to login ─────────────────────────────
  function redirectToLogin(next?: string) {
    const loginUrl = req.nextUrl.clone();
    loginUrl.pathname = '/login';
    if (next && next !== '/' && next !== '/login' && next !== '/register') {
      loginUrl.searchParams.set('next', next);
    }
    const res = NextResponse.redirect(loginUrl);
    // If an invalid session cookie was present, clear it
    if (sessionCookie && !verifiedSession) {
      res.cookies.set(SESSION_COOKIE_NAME, '', { path: '/', maxAge: 0 });
    }
    return res;
  }

  // ── Helper: redirect authenticated user to their authorized portal ────────
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

  // ── Logged-In User Redirects on /login and /register ────────────────────────
  if (isAuthenticated && (pathname === '/login' || pathname === '/register')) {
    const nextParam = req.nextUrl.searchParams.get('next');
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

  // ── Root /pastor redirect ──────────────────────────────────────────────────
  if (pathname === '/pastor' || pathname === '/pastor/') {
    if (!isAuthenticated) return redirectToLogin('/pastor/main/dashboard');
    if (!isPastorRole) return redirectToAuthorizedPortal();
    const target = req.nextUrl.clone();
    target.pathname = '/pastor/main/dashboard';
    return NextResponse.redirect(target);
  }

  // ── Root /admin redirect ───────────────────────────────────────────────────
  if (pathname === '/admin' || pathname === '/admin/') {
    if (!isAuthenticated) return redirectToLogin('/admin/dashboard');
    if (!isAdminRole) return redirectToAuthorizedPortal();
    const target = req.nextUrl.clone();
    target.pathname = '/admin/dashboard';
    return NextResponse.redirect(target);
  }

  // ── Guard: /admin/* pages ───────────────────────────────────────────────────
  if (ADMIN_PREFIXES.some((p) => pathname === p || pathname.startsWith(p + '/'))) {
    if (!isAuthenticated) return redirectToLogin(pathname);
    if (!isAdminRole) return redirectToAuthorizedPortal();
    return NextResponse.next();
  }

  // ── Guard: /pastor/* pages ──────────────────────────────────────────────────
  if (PASTOR_PREFIXES.some((p) => pathname === p || pathname.startsWith(p + '/'))) {
    if (!isAuthenticated) return redirectToLogin(pathname);
    if (!isPastorRole) return redirectToAuthorizedPortal();
    return NextResponse.next();
  }

  // ── Guard: /event-manager/* pages ────────────────────────────────────────────
  if (EVENT_MANAGER_PREFIXES.some((p) => pathname === p || pathname.startsWith(p + '/'))) {
    if (!isAuthenticated) return redirectToLogin(pathname);
    if (!isVolunteerRole) return redirectToAuthorizedPortal();
    return NextResponse.next();
  }

  // ── Guard: /field-volunteer/* pages ──────────────────────────────────────────
  if (FIELD_VOLUNTEER_PREFIXES.some((p) => pathname === p || pathname.startsWith(p + '/'))) {
    if (!isAuthenticated) return redirectToLogin(pathname);
    if (!isVolunteerRole) return redirectToAuthorizedPortal();
    return NextResponse.next();
  }

  // ── Guard: /member/* pages ──────────────────────────────────────────────────
  if (MEMBER_PREFIXES.some((p) => pathname === p || pathname.startsWith(p + '/'))) {
    if (!isAuthenticated) return redirectToLogin(pathname);
    return NextResponse.next();
  }

  // ── Guard: /api/admin/* endpoints ───────────────────────────────────────────
  if (ADMIN_API_PREFIXES.some((p) => pathname.startsWith(p))) {
    if (!isAuthenticated) {
      return NextResponse.json({ error: 'Authentication required. Please sign in.' }, { status: 401 });
    }
    if (!isAdminRole) {
      return NextResponse.json({ error: 'Access denied. Admin privileges required.' }, { status: 403 });
    }
    return NextResponse.next();
  }

  // ── Guard: /api/pastor/* endpoints ──────────────────────────────────────────
  if (PASTOR_API_PREFIXES.some((p) => pathname.startsWith(p))) {
    const isGetPublicPastorResource =
      req.method === 'GET' &&
      (pathname.startsWith('/api/pastor/sermons') || pathname.startsWith('/api/pastor/announcements'));

    if (!isGetPublicPastorResource) {
      if (!isAuthenticated) {
        return NextResponse.json({ error: 'Authentication required. Please sign in.' }, { status: 401 });
      }
      const isSermonOrAnnouncementEndpoint =
        pathname.startsWith('/api/pastor/sermons') ||
        pathname.startsWith('/api/pastor/announcements') ||
        pathname.startsWith('/api/pastor/clear-seeded-sermons');
      const canAccess = isPastorRole || (isSermonOrAnnouncementEndpoint && isVolunteerRole);
      if (!canAccess) {
        return NextResponse.json({ error: 'Access denied. Pastor or Admin privileges required.' }, { status: 403 });
      }
    }
    return NextResponse.next();
  }

  // ── Guard: /api/event-manager/* endpoints ────────────────────────────────────
  if (EVENT_MANAGER_API_PREFIXES.some((p) => pathname.startsWith(p))) {
    if (!isAuthenticated) {
      return NextResponse.json({ error: 'Authentication required. Please sign in.' }, { status: 401 });
    }
    if (!isVolunteerRole) {
      return NextResponse.json({ error: 'Access denied. Event Management privileges required.' }, { status: 403 });
    }
    return NextResponse.next();
  }

  // ── Guard: /api/field-volunteer/* endpoints ───────────────────────────────────
  if (FIELD_VOLUNTEER_API_PREFIXES.some((p) => pathname.startsWith(p))) {
    if (!isAuthenticated) {
      return NextResponse.json({ error: 'Authentication required. Please sign in.' }, { status: 401 });
    }
    if (!isVolunteerRole) {
      return NextResponse.json({ error: 'Access denied. Volunteer privileges required.' }, { status: 403 });
    }
    return NextResponse.next();
  }

  const res = NextResponse.next();
  const isPrivatePath =
    pathname.startsWith('/admin') ||
    pathname.startsWith('/member') ||
    pathname.startsWith('/pastor') ||
    pathname.startsWith('/event-manager') ||
    pathname.startsWith('/event-management') ||
    pathname.startsWith('/field-volunteer') ||
    pathname.startsWith('/portal-select') ||
    pathname.startsWith('/login') ||
    pathname.startsWith('/register') ||
    pathname.startsWith('/forgot-password') ||
    pathname.startsWith('/api/');

  if (isPrivatePath) {
    res.headers.set('X-Robots-Tag', 'noindex, nofollow');
  }

  return res;
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
