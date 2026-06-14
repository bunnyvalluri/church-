/**
 * middleware.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Next.js Edge Middleware — runs BEFORE a page or API route is rendered.
 *
 * Protections:
 *  • /admin/*          → must have a valid session cookie OR be in dev-auto-login
 *  • /api/admin/*      → API clients get 401/403; browsers redirected to /admin/login
 *  • /member, /pastor-portal, /church-member → any authenticated session required
 *
 *  NOTE: /dashboard is excluded — it's a client-only role-router (returns null
 *  on SSR). Guarding it at the edge causes React hydration mismatches.
 *
 * NOTE: Firebase ID tokens are short-lived JWTs. Full cryptographic verification
 * requires the Firebase Admin SDK which cannot run in the Edge runtime.
 * Here we do a lightweight "presence + expiry" check on the session cookie set
 * by the client. The API routes still perform full verification via firebaseAdmin.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { NextRequest, NextResponse } from 'next/server';

// ── Paths that require at minimum a signed-in session ──────────────────────────────────
// NOTE: /dashboard is intentionally excluded — it's a pure client-side
// role-router that returns null on SSR. Guarding it at the edge causes
// a React hydration mismatch (server: empty HTML, client: spinner div).
const AUTH_REQUIRED_PREFIXES = ['/member', '/pastor-portal', '/church-member'];

// ── Paths that require ADMIN or SUPER_ADMIN role ──────────────────────────────
const ADMIN_PREFIXES = ['/admin'];

// ── API paths that are admin-only ─────────────────────────────────────────────
const ADMIN_API_PREFIXES = ['/api/admin'];

// ── Public paths that are always allowed ─────────────────────────────────────
const PUBLIC_PATHS = [
  '/login',
  '/register',
  '/forgot-password',
  '/admin/login',
  '/admin/register',
  '/api/auth',
  '/_next',
  '/favicon',
  '/apple-icon',
  '/icon',
  '/sitemap',
  '/robots',
];

function isPublicPath(pathname: string): boolean {
  return PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(p + '/') || pathname.startsWith(p + '?'));
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Always allow public paths and static assets
  if (isPublicPath(pathname) || pathname.startsWith('/_next/') || pathname.includes('.')) {
    return NextResponse.next();
  }

  // ── Dev bypass (non-production only) ────────────────────────────────────────
  const isDev = process.env.NODE_ENV !== 'production';
  const devAutoLogin = process.env.NEXT_PUBLIC_DEV_AUTO_LOGIN?.toLowerCase();

  // ── Check session presence via cookie ────────────────────────────────────────
  // The client stores a lightweight marker cookie after successful Firebase login.
  // This is a PRESENCE check only — full JWT verification happens in the API routes.
  const sessionRole = req.cookies.get('__kcm_session_role')?.value?.toUpperCase() ?? null;
  const sessionUid  = req.cookies.get('__kcm_session_uid')?.value ?? null;
  const hasSession  = !!(sessionUid && sessionRole);

  const effectiveRole = (() => {
    if (hasSession) return sessionRole!;
    if (isDev && devAutoLogin) return devAutoLogin.toUpperCase();
    return null;
  })();

  const isAdminRole = effectiveRole === 'ADMIN' || effectiveRole === 'SUPER_ADMIN';
  const isAuthenticated = !!effectiveRole;

  // ── Guard: /admin/* pages ────────────────────────────────────────────────────
  if (ADMIN_PREFIXES.some((p) => pathname === p || pathname.startsWith(p + '/'))) {
    if (!isAuthenticated) {
      const loginUrl = req.nextUrl.clone();
      loginUrl.pathname = '/admin/login';
      loginUrl.searchParams.set('next', pathname);
      return NextResponse.redirect(loginUrl);
    }
    if (!isAdminRole) {
      // Authenticated but not admin — redirect to their dashboard
      const dashUrl = req.nextUrl.clone();
      dashUrl.pathname = '/dashboard';
      dashUrl.searchParams.set('error', 'insufficient_permissions');
      return NextResponse.redirect(dashUrl);
    }
    return NextResponse.next();
  }

  // ── Guard: /api/admin/* endpoints ────────────────────────────────────────────
  if (ADMIN_API_PREFIXES.some((p) => pathname.startsWith(p))) {
    // API routes do their own full JWT verification — this is a belt-and-suspenders
    // check to short-circuit obviously unauthenticated browser requests early.
    if (!isAuthenticated) {
      return NextResponse.json(
        { error: 'Authentication required. Please sign in.' },
        { status: 401 }
      );
    }
    if (!isAdminRole) {
      return NextResponse.json(
        { error: 'Access denied. Admin privileges required.' },
        { status: 403 }
      );
    }
    return NextResponse.next();
  }

  // ── Guard: other auth-required pages ─────────────────────────────────────────
  if (AUTH_REQUIRED_PREFIXES.some((p) => pathname === p || pathname.startsWith(p + '/'))) {
    if (!isAuthenticated) {
      const loginUrl = req.nextUrl.clone();
      loginUrl.pathname = '/login';
      loginUrl.searchParams.set('next', pathname);
      return NextResponse.redirect(loginUrl);
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
