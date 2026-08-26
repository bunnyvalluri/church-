export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import {
  SESSION_COOKIE_NAME,
  verifyServerSession,
  revokeServerSession,
  removeSessionCookie,
} from '@/lib/session';
import { verifyFirebaseToken, isAdminReady } from '@/lib/firebaseAdmin';
import { getClientIp } from '@/lib/apiResponse';

// ── GET /api/auth/session ─────────────────────────────────────────────────────
// Reads the secure HttpOnly session cookie, validates against PostgreSQL,
// and returns the active authenticated user and role.
export async function GET(req: Request) {
  try {
    // 1. Authoritative HttpOnly Session Cookie Verification
    const cookieHeader = req.headers.get('cookie') ?? '';
    const sessionMatch = cookieHeader.match(new RegExp(`${SESSION_COOKIE_NAME}=([^;]+)`));

    if (sessionMatch && sessionMatch[1]) {
      const sessionUser = await verifyServerSession(sessionMatch[1]);
      if (sessionUser) {
        return NextResponse.json(
          {
            authenticated: true,
            user: {
              uid: sessionUser.uid,
              email: sessionUser.email,
              name: sessionUser.name || 'Member',
              image: sessionUser.image || null,
              role: sessionUser.role,
            },
          },
          { status: 200 }
        );
      }
    }

    // 2. Cryptographic Bearer Token Check (Fallback for Mobile/API Clients)
    const authHeader = req.headers.get('Authorization') ?? '';
    const bearerToken = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

    if (bearerToken && !bearerToken.startsWith('session-token-') && isAdminReady()) {
      const decoded = await verifyFirebaseToken(bearerToken);
      if (decoded) {
        return NextResponse.json(
          {
            authenticated: true,
            user: {
              uid: decoded.uid,
              email: decoded.email ?? '',
              name: decoded.name ?? (decoded.email ? decoded.email.split('@')[0] : 'Member'),
              image: decoded.picture ?? null,
              role: 'MEMBER',
            },
          },
          { status: 200 }
        );
      }
    }

    // Unauthenticated
    return NextResponse.json({ authenticated: false, user: null }, { status: 200 });
  } catch (err) {
    console.error('[AUTH/SESSION/GET] Error:', err);
    return NextResponse.json({ authenticated: false, user: null }, { status: 500 });
  }
}

// ── DELETE /api/auth/session ──────────────────────────────────────────────────
// Server-side session revocation & cookie erasure hook.
export async function DELETE(req: Request) {
  const ip = getClientIp(req);
  console.log(`[AUTH/SESSION] Logout initiated from IP: ${ip}`);

  try {
    const cookieHeader = req.headers.get('cookie') ?? '';
    const sessionMatch = cookieHeader.match(new RegExp(`${SESSION_COOKIE_NAME}=([^;]+)`));

    if (sessionMatch && sessionMatch[1]) {
      const parts = sessionMatch[1].split('.');
      if (parts.length >= 1 && parts[0]) {
        const sessionId = parts[0];
        await revokeServerSession(sessionId);
      }
    }
  } catch (revocationErr) {
    console.warn('[AUTH/SESSION] Session revocation warning:', revocationErr);
  }

  const response = NextResponse.json({ success: true, message: 'Logged out' });
  const isHttps = req.headers.get('x-forwarded-proto') === 'https' || req.url.startsWith('https:');
  removeSessionCookie(response, process.env.NODE_ENV === 'production' || isHttps);

  return response;
}
