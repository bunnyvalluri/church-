import { NextResponse } from 'next/server';
import { verifyFirebaseToken, isAdminReady } from '@/lib/firebaseAdmin';
import { getClientIp } from '@/lib/apiResponse';

// ── GET /api/auth/session ─────────────────────────────────────────────────────
// Verifies the Firebase ID token sent as Authorization: Bearer <token>
// Returns the decoded user if valid, { authenticated: false } if not.
export async function GET(req: Request) {
  try {
    const authHeader = req.headers.get('Authorization') ?? '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

    // No token provided — unauthenticated session
    if (!token) {
      return NextResponse.json({ user: null, authenticated: false }, { status: 200 });
    }

    // ── Real Firebase Admin token verification ──────────────────────────────
    if (isAdminReady()) {
      const decoded = await verifyFirebaseToken(token);

      if (!decoded) {
        return NextResponse.json(
          { user: null, authenticated: false, error: 'Invalid or expired token.' },
          { status: 401 }
        );
      }

      return NextResponse.json({
        authenticated: true,
        user: {
          uid: decoded.uid,
          email: decoded.email,
          name: decoded.name,
          picture: decoded.picture,
          email_verified: decoded.email_verified,
        },
      });
    }

    // ── Fallback: SDK not set up (stub mode) ────────────────────────────────
    // IMPORTANT: This accepts any token without verification.
    // To enable real verification: set FIREBASE_ADMIN_SERVICE_ACCOUNT in .env.local
    console.warn('[AUTH/SESSION] ⚠️  Firebase Admin SDK not initialised — token NOT cryptographically verified.');
    return NextResponse.json({
      authenticated: true,
      user: null,
      note: 'Token received — set FIREBASE_ADMIN_SERVICE_ACCOUNT to enable server-side verification.',
    });

  } catch (err) {
    console.error('[AUTH/SESSION] Error:', err);
    return NextResponse.json({ user: null, authenticated: false }, { status: 500 });
  }
}

// ── DELETE /api/auth/session — server-side logout hook ───────────────────────
export async function DELETE(req: Request) {
  const ip = getClientIp(req);
  console.log(`[AUTH/SESSION] Logout from IP: ${ip}`);

  // When Firebase Admin is set up: revoke refresh tokens here
  // const authHeader = req.headers.get('Authorization') ?? '';
  // const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
  // if (token && isAdminReady()) {
  //   const decoded = await verifyFirebaseToken(token);
  //   if (decoded) await getAuth().revokeRefreshTokens(decoded.uid);
  // }

  return NextResponse.json({ success: true, message: 'Logged out' });
}
