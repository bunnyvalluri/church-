/**
 * lib/authMiddleware.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Reusable server-side authentication & authorization middleware for
 * Next.js App Router API routes.
 *
 * Usage — protect an entire route:
 *   const auth = await requireAuth(req);
 *   if (auth instanceof NextResponse) return auth;   // 401/403 already sent
 *   // auth.uid, auth.email, auth.role are now available
 *
 * Usage — protect admin-only route:
 *   const auth = await requireAdmin(req);
 *   if (auth instanceof NextResponse) return auth;
 *
 * Usage — soft check (no automatic response):
 *   const token = await getTokenFromRequest(req);
 *   if (!token) { ... }
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { NextResponse } from 'next/server';
import { verifyFirebaseToken } from '@/lib/firebaseAdmin';
import { prisma } from '@/lib/prisma';

// ── Types ──────────────────────────────────────────────────────────────────────
export interface AuthenticatedUser {
  uid: string;
  email: string;
  name?: string;
  role: 'SUPER_ADMIN' | 'ADMIN' | 'PASTOR' | 'MEMBER' | 'EVENT_MANAGER' | 'FIELD_VOLUNTEER' | 'NGO_ADMIN';
}

type AdminRole = 'SUPER_ADMIN' | 'ADMIN';
type StaffRole = 'SUPER_ADMIN' | 'ADMIN' | 'PASTOR';

// ── Internal: Extract Bearer token from request ────────────────────────────────
function extractToken(req: Request): string | null {
  const authHeader = req.headers.get('Authorization') ?? '';
  if (authHeader.startsWith('Bearer ') && authHeader.length > 7) {
    return authHeader.slice(7);
  }
  return null;
}

// ── Internal: Look up user role from DB ───────────────────────
async function resolveRole(uid: string, email: string): Promise<AuthenticatedUser['role']> {
  const user = await prisma.user.findUnique({ where: { id: uid }, select: { role: true } })
    ?? await prisma.user.findUnique({ where: { email }, select: { role: true } });
  if (user) return user.role as AuthenticatedUser['role'];
  return 'MEMBER'; // Safest default
}

// ── Public: Soft token extraction (no auto-response) ──────────────────────────
/**
 * Extracts and verifies the Firebase ID token from the request.
 * Returns the authenticated user info or null if unauthenticated.
 * Does NOT send a response — the caller must handle the null case.
 */
export async function getAuthenticatedUser(req: Request): Promise<AuthenticatedUser | null> {
  let authenticatedUser: AuthenticatedUser | null = null;

  // 1. Always try the real Bearer token first (highest priority).
  //    This ensures that real Firebase users are correctly identified even in dev mode.
  const token = extractToken(req);
  if (token) {
    const decoded = await verifyFirebaseToken(token);
    if (decoded) {
      const role = await resolveRole(decoded.uid, decoded.email ?? '');
      authenticatedUser = {
        uid: decoded.uid,
        email: decoded.email ?? '',
        name: decoded.name ?? (decoded.email ? decoded.email.split('@')[0] : 'Member'),
        role,
      };
    }
  }

  // 2. Dev bypass fallback — only used when no real token is in the request.
  //    This prevents UID mismatch errors where the dev mock UID differs from the
  //    real Firebase UID stored in session records.
  if (!authenticatedUser && process.env.NODE_ENV !== 'production') {
    const devUser = getDevBypassUser();
    if (devUser) {
      authenticatedUser = devUser;
    }
  }

  // 3. Self-healing DB synchronization
  if (authenticatedUser) {
    const { uid, email, name, role } = authenticatedUser;
    try {
      let userInDb = await prisma.user.findUnique({ where: { id: uid } });
      if (!userInDb && email) {
        userInDb = await prisma.user.findUnique({ where: { email } });
        if (userInDb) {
          // Align user ID with Firebase UID if email matches
          userInDb = await prisma.user.update({
            where: { email },
            data: { id: uid }
          });
        }
      }

      if (!userInDb) {
        await prisma.user.create({
          data: {
            id: uid,
            email,
            name: name || 'Member',
            password: 'firebase-authenticated-sync',
            role,
          }
        });
        console.info(`[AUTH_MIDDLEWARE] Dynamic sync: Created user record for ${email} (${uid}) in database.`);
      }
    } catch (dbErr) {
      console.warn('[AUTH_MIDDLEWARE] Failed to dynamically sync user to database:', dbErr);
    }
  }

  return authenticatedUser;
}

// ── Public: Require any valid Firebase auth ────────────────────────────────────
/**
 * Returns AuthenticatedUser if the request carries a valid Firebase ID token.
 * Returns NextResponse(401) if unauthenticated.
 */
export async function requireAuth(req: Request): Promise<AuthenticatedUser | NextResponse> {
  if (process.env.NODE_ENV !== 'production' && !process.env.FIREBASE_ADMIN_SERVICE_ACCOUNT) {
    return {
      uid: 'dev_bypass_uid',
      email: 'dev@kcm.local',
      name: 'Dev User',
      role: 'SUPER_ADMIN',
    };
  }
  const user = await getAuthenticatedUser(req);
  if (!user) {
    return NextResponse.json(
      { error: 'Authentication required. Please sign in.' },
      { status: 401 }
    );
  }
  return user;
}

// ── Public: Require ADMIN or SUPER_ADMIN role ─────────────────────────────────
/**
 * Returns AuthenticatedUser if the request is from an authenticated admin.
 * Returns NextResponse(401) if unauthenticated, NextResponse(403) if insufficient role.
 */
export async function requireAdmin(req: Request): Promise<AuthenticatedUser | NextResponse> {
  if (process.env.NODE_ENV !== 'production' && !process.env.FIREBASE_ADMIN_SERVICE_ACCOUNT) {
    return {
      uid: 'dev_bypass_uid',
      email: 'dev@kcm.local',
      name: 'Dev Administrator',
      role: 'SUPER_ADMIN',
    };
  }
  const user = await getAuthenticatedUser(req);

  if (!user) {
    return NextResponse.json(
      { error: 'Authentication required. Please sign in.' },
      { status: 401 }
    );
  }

  const adminRoles: AdminRole[] = ['ADMIN', 'SUPER_ADMIN'];
  if (!adminRoles.includes(user.role as AdminRole)) {
    return NextResponse.json(
      { error: 'Access denied. Admin privileges required.' },
      { status: 403 }
    );
  }

  return user;
}

// ── Public: Require PASTOR, ADMIN, or SUPER_ADMIN role ────────────────────────
/**
 * Returns AuthenticatedUser if the request is from staff (pastor+).
 * Returns NextResponse(401/403) otherwise.
 */
export async function requireStaff(req: Request): Promise<AuthenticatedUser | NextResponse> {
  if (process.env.NODE_ENV !== 'production' && !process.env.FIREBASE_ADMIN_SERVICE_ACCOUNT) {
    return {
      uid: 'dev_bypass_uid',
      email: 'dev@kcm.local',
      name: 'Dev Staff Member',
      role: 'SUPER_ADMIN',
    };
  }
  const user = await getAuthenticatedUser(req);

  if (!user) {
    return NextResponse.json(
      { error: 'Authentication required. Please sign in.' },
      { status: 401 }
    );
  }

  const staffRoles: StaffRole[] = ['PASTOR', 'ADMIN', 'SUPER_ADMIN'];
  if (!staffRoles.includes(user.role as StaffRole)) {
    return NextResponse.json(
      { error: 'Access denied. Staff privileges required.' },
      { status: 403 }
    );
  }

  return user;
}

// ── Public: Dev bypass (NEVER use in production) ───────────────────────────────
/**
 * In development (when NEXT_PUBLIC_DEV_AUTO_LOGIN is set), bypasses Firebase
 * verification and returns a mock user with the given role.
 * In production, this always returns null.
 */
export function getDevBypassUser(): AuthenticatedUser | null {
  if (process.env.NODE_ENV === 'production') return null;

  const devRole = process.env.NEXT_PUBLIC_DEV_AUTO_LOGIN?.toLowerCase();
  if (!devRole) return null;

  const roleMap: Record<string, AuthenticatedUser['role']> = {
    admin: 'ADMIN',
    super_admin: 'SUPER_ADMIN',
    pastor: 'PASTOR',
    member: 'MEMBER',
    event_manager: 'EVENT_MANAGER',
    field_volunteer: 'FIELD_VOLUNTEER',
  };

  const role = roleMap[devRole];
  if (!role) return null;

  return {
    uid: 'dev-auto-login-uid',
    email: 'bishop.kraju@kcmchurch.org',
    name: 'Bishop Kurra Kristhu Raju',
    role,
  };
}

/**
 * Same as requireAdmin but with dev bypass support for local development.
 */
export async function requireAdminOrDev(req: Request): Promise<AuthenticatedUser | NextResponse> {
  // Dev bypass — local dev only
  if (process.env.NODE_ENV !== 'production') {
    const devUser = getDevBypassUser();
    if (devUser && (devUser.role === 'ADMIN' || devUser.role === 'SUPER_ADMIN' || devUser.role === 'PASTOR')) {
      return devUser;
    }
    
    // Automatically bypass if Firebase Admin is not configured locally
    if (!process.env.FIREBASE_ADMIN_SERVICE_ACCOUNT) {
      return {
        uid: 'dev_bypass_uid',
        email: 'dev@kcm.local',
        name: 'Dev Administrator',
        role: 'SUPER_ADMIN',
      };
    }
  }
  return requireAdmin(req);
}

/**
 * Same as requireStaff (PASTOR + ADMIN + SUPER_ADMIN) but with dev bypass.
 * Use for endpoints that Pastors should also be able to access.
 */
export async function requireStaffOrDev(req: Request): Promise<AuthenticatedUser | NextResponse> {
  // Dev bypass — local dev only
  if (process.env.NODE_ENV !== 'production') {
    const devUser = getDevBypassUser();
    if (devUser) return devUser;

    // Automatically bypass if Firebase Admin is not configured locally
    if (!process.env.FIREBASE_ADMIN_SERVICE_ACCOUNT) {
      return {
        uid: 'dev_bypass_uid',
        email: 'dev@kcm.local',
        name: 'Dev Staff',
        role: 'SUPER_ADMIN',
      };
    }
  }
  return requireStaff(req);
}

// ── Public: Require EVENT_MANAGER, ADMIN, or SUPER_ADMIN role ─────────────────
export async function requireEventManager(req: Request): Promise<AuthenticatedUser | NextResponse> {
  if (process.env.NODE_ENV !== 'production' && !process.env.FIREBASE_ADMIN_SERVICE_ACCOUNT) {
    return {
      uid: 'dev_bypass_uid',
      email: 'dev@kcm.local',
      name: 'Dev Event Manager',
      role: 'EVENT_MANAGER',
    };
  }
  const user = await getAuthenticatedUser(req);
  if (!user) {
    return NextResponse.json(
      { error: 'Authentication required. Please sign in.' },
      { status: 401 }
    );
  }
  const allowedRoles = ['EVENT_MANAGER', 'ADMIN', 'SUPER_ADMIN', 'PASTOR'];
  if (!allowedRoles.includes(user.role)) {
    return NextResponse.json(
      { error: 'Access denied. Event Manager privileges required.' },
      { status: 403 }
    );
  }
  return user;
}

// ── Public: Require FIELD_VOLUNTEER, EVENT_MANAGER, ADMIN, or SUPER_ADMIN role ──
export async function requireFieldVolunteer(req: Request): Promise<AuthenticatedUser | NextResponse> {
  if (process.env.NODE_ENV !== 'production' && !process.env.FIREBASE_ADMIN_SERVICE_ACCOUNT) {
    return {
      uid: 'dev_bypass_uid',
      email: 'dev@kcm.local',
      name: 'Dev Field Volunteer',
      role: 'FIELD_VOLUNTEER',
    };
  }
  const user = await getAuthenticatedUser(req);
  if (!user) {
    return NextResponse.json(
      { error: 'Authentication required. Please sign in.' },
      { status: 401 }
    );
  }
  const allowedRoles = ['FIELD_VOLUNTEER', 'EVENT_MANAGER', 'ADMIN', 'SUPER_ADMIN'];
  if (!allowedRoles.includes(user.role)) {
    return NextResponse.json(
      { error: 'Access denied. Volunteer privileges required.' },
      { status: 403 }
    );
  }
  return user;
}

export async function requireEventManagerOrDev(req: Request): Promise<AuthenticatedUser | NextResponse> {
  if (process.env.NODE_ENV !== 'production') {
    const devUser = getDevBypassUser();
    if (devUser && ['ADMIN', 'SUPER_ADMIN', 'PASTOR', 'EVENT_MANAGER'].includes(devUser.role)) {
      return devUser;
    }
    const user = await getAuthenticatedUser(req);
    if (user && ['ADMIN', 'SUPER_ADMIN', 'PASTOR', 'EVENT_MANAGER'].includes(user.role)) {
      return user;
    }
    return {
      uid: 'dev_bypass_uid',
      email: 'dev@kcm.local',
      name: 'Dev Event Manager',
      role: 'EVENT_MANAGER',
    };
  }
  return requireEventManager(req);
}

export async function requireFieldVolunteerOrDev(req: Request): Promise<AuthenticatedUser | NextResponse> {
  if (process.env.NODE_ENV !== 'production') {
    const devUser = getDevBypassUser();
    if (devUser && ['ADMIN', 'SUPER_ADMIN', 'PASTOR', 'EVENT_MANAGER', 'FIELD_VOLUNTEER'].includes(devUser.role)) {
      return devUser;
    }
    const user = await getAuthenticatedUser(req);
    if (user && ['ADMIN', 'SUPER_ADMIN', 'PASTOR', 'EVENT_MANAGER', 'FIELD_VOLUNTEER'].includes(user.role)) {
      return user;
    }
    return {
      uid: 'dev_bypass_uid',
      email: 'dev@kcm.local',
      name: 'Dev Field Volunteer',
      role: 'FIELD_VOLUNTEER',
    };
  }
  return requireFieldVolunteer(req);
}
