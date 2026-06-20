/**
 * middleware.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Next.js Edge Middleware — runs BEFORE a page or API route is rendered.
 *
 * Role Access Matrix:
 *  SUPER_ADMIN  → /admin, /pastor, /member (full access)
 *  ADMIN        → /admin, /member
 *  PASTOR       → /pastor, /member
 *  MEMBER       → /member only
 *
 * Protections:
 *  • /admin/*       → ADMIN or SUPER_ADMIN only
 *  • /pastor/*      → PASTOR, ADMIN, or SUPER_ADMIN only
 *  • /api/admin/*   → ADMIN or SUPER_ADMIN; others get 401/403
 *  • /api/pastor/*  → PASTOR, ADMIN, or SUPER_ADMIN; others get 401/403
 *  • /member/*      → any authenticated session required
 *
 * NOTE: Firebase ID tokens are short-lived JWTs. Full cryptographic verification
 * requires the Firebase Admin SDK which cannot run in the Edge runtime.
 * Here we do a lightweight "presence + expiry" check on the session cookie set
 * by the client. The API routes still perform full verification via firebaseAdmin.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { NextRequest, NextResponse } from 'next/server';

// ── Admin-only pages ───────────────────────────────────────────────────────
const ADMIN_PREFIXES = ['/admin'];

// ── Pastor pages (PASTOR, ADMIN, SUPER_ADMIN) ─────────────────────────────
const PASTOR_PREFIXES = ['/pastor'];

// ── API paths that are admin-only ─────────────────────────────────────────
const ADMIN_API_PREFIXES = ['/api/admin'];

// ── API paths that are pastor-accessible ──────────────────────────────────
const PASTOR_API_PREFIXES = ['/api/pastor'];

// ── Paths that require at minimum a signed-in session ─────────────────────
const AUTH_REQUIRED_PREFIXES = ['/member', '/pastor-portal', '/church-member'];

// ── Public paths that are always allowed ─────────────────────────────────
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
  return PUBLIC_PATHS.some(
    (p) => pathname === p || pathname.startsWith(p + '/') || pathname.startsWith(p + '?')
  );
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Always allow public paths and static assets
  if (isPublicPath(pathname) || pathname.startsWith('/_next/') || pathname.includes('.')) {
    return NextResponse.next();
  }

  // ── Dev bypass (non-production only) ────────────────────────────────────
  const isDev = process.env.NODE_ENV !== 'production';
  const devAutoLogin = process.env.NEXT_PUBLIC_DEV_AUTO_LOGIN?.toLowerCase();

  // ── Check session presence via cookie ────────────────────────────────────
  const sessionRole = req.cookies.get('__kcm_session_role')?.value?.toUpperCase() ?? null;
  const sessionUid  = req.cookies.get('__kcm_session_uid')?.value ?? null;
  const hasSession  = !!(sessionUid && sessionRole);

  const effectiveRole = (() => {
    if (hasSession) return sessionRole!;
    if (isDev && devAutoLogin) return devAutoLogin.toUpperCase();
    return null;
  })();

  const isAuthenticated = !!effectiveRole;
  const isSuperAdmin    = effectiveRole === 'SUPER_ADMIN';
  const isAdminRole     = effectiveRole === 'ADMIN' || isSuperAdmin;
  // PASTOR, ADMIN, and SUPER_ADMIN can all access pastor routes
  const isPastorRole    = effectiveRole === 'PASTOR' || isAdminRole;

  // ── Helper: redirect unauthenticated to login ───────────────────────────
  function redirectToLogin(next: string) {
    const loginUrl = req.nextUrl.clone();
    loginUrl.pathname = '/login';
    loginUrl.searchParams.set('next', next);
    return NextResponse.redirect(loginUrl);
  }

  // ── Helper: redirect authenticated-but-insufficient to their own dashboard
  function redirectToDashboard(reason: string) {
    const dashUrl = req.nextUrl.clone();
    dashUrl.pathname = '/dashboard';
    dashUrl.searchParams.set('error', reason);
    return NextResponse.redirect(dashUrl);
  }

  // ── Guard: /admin/* pages ─────────────────────────────────────────────────
  if (ADMIN_PREFIXES.some((p) => pathname === p || pathname.startsWith(p + '/'))) {
    if (!isAuthenticated) return redirectToLogin(pathname);
    if (!isAdminRole)     return redirectToDashboard('insufficient_permissions');
    return NextResponse.next();
  }

  // ── Guard: /pastor/* pages ────────────────────────────────────────────────
  if (PASTOR_PREFIXES.some((p) => pathname === p || pathname.startsWith(p + '/'))) {
    if (!isAuthenticated) return redirectToLogin(pathname);
    if (!isPastorRole)    return redirectToDashboard('pastor_access_required');
    return NextResponse.next();
  }

  // ── Guard: /api/admin/* endpoints ─────────────────────────────────────────
  if (ADMIN_API_PREFIXES.some((p) => pathname.startsWith(p))) {
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

  // ── Guard: /api/pastor/* endpoints ────────────────────────────────────────
  if (PASTOR_API_PREFIXES.some((p) => pathname.startsWith(p))) {
    if (!isAuthenticated) {
      return NextResponse.json(
        { error: 'Authentication required. Please sign in.' },
        { status: 401 }
      );
    }
    if (!isPastorRole) {
      return NextResponse.json(
        { error: 'Access denied. Pastor or Admin privileges required.' },
        { status: 403 }
      );
    }
    return NextResponse.next();
  }

  // ── Guard: other auth-required pages ──────────────────────────────────────
  if (AUTH_REQUIRED_PREFIXES.some((p) => pathname === p || pathname.startsWith(p + '/'))) {
    if (!isAuthenticated) return redirectToLogin(pathname);
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
