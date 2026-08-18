import { NextResponse } from 'next/server';
import { OAuth2Client } from 'google-auth-library';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import sanitizeHtml from 'sanitize-html';

// ── Validation Schema ────────────────────────────────────────────────────────
const googleAuthSchema = z.object({
  credential: z.string().min(20).optional(),
  accessToken: z.string().min(20).optional(),
  idToken: z.string().min(20).optional(),
}).refine((data) => data.credential || data.accessToken || data.idToken, {
  message: 'Google credential token or access token is required',
});

// ── Sanitizer Helper ─────────────────────────────────────────────────────────
const sanitize = (s: string) =>
  sanitizeHtml(s, {
    allowedTags: [],
    allowedAttributes: {},
    disallowedTagsMode: 'discard',
  });

const DEFAULT_ROLE = 'MEMBER';

// Allowed Google Client IDs for audience verification
function getGoogleClientIds(): string[] {
  const ids = [
    process.env.GOOGLE_CLIENT_ID,
    process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
  ].filter(Boolean) as string[];
  
  // Return unique trimmed non-empty client IDs
  return Array.from(new Set(ids.map((id) => id.trim()))).filter((id) => id.length > 0);
}

// ── Google OAuth Client Singleton ───────────────────────────────────────────
let oauth2Client: OAuth2Client | null = null;

function getOAuth2Client(): OAuth2Client {
  if (!oauth2Client) {
    oauth2Client = new OAuth2Client();
  }
  return oauth2Client;
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);
    if (!body) {
      return NextResponse.json(
        { error: 'Invalid request body' },
        { status: 400 }
      );
    }

    // 1. Validate Input
    const parseResult = googleAuthSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Invalid Google authentication parameters' },
        { status: 400 }
      );
    }

    const { credential, accessToken, idToken } = parseResult.data;
    const clientIds = getGoogleClientIds();

    let googleSub = '';
    let googleEmail = '';
    let googleName = '';
    let googlePicture: string | null = null;

    // 2. Authenticate and Extract Claims (Via Access Token or ID Token)
    if (accessToken) {
      // Direct verification via Google OAuth2 UserInfo API
      try {
        const userInfoRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        if (!userInfoRes.ok) {
          const errText = await userInfoRes.text().catch(() => '');
          console.warn('[AUTH/GOOGLE] ⚠ Google UserInfo failed:', userInfoRes.status, errText);
          return NextResponse.json(
            { error: 'Failed to verify Google access token. Please try signing in again.' },
            { status: 401 }
          );
        }

        const userInfo = await userInfoRes.json();
        if (!userInfo.sub || !userInfo.email) {
          return NextResponse.json(
            { error: 'Incomplete profile returned from Google.' },
            { status: 401 }
          );
        }

        if (userInfo.email_verified === false) {
          return NextResponse.json(
            { error: 'Google account email is unverified. Please verify your email with Google first.' },
            { status: 403 }
          );
        }

        googleSub = sanitize(userInfo.sub);
        googleEmail = sanitize(userInfo.email.toLowerCase().trim());
        googleName = userInfo.name ? sanitize(userInfo.name) : googleEmail.split('@')[0];
        googlePicture = userInfo.picture ? sanitize(userInfo.picture) : null;
      } catch (accessErr: any) {
        console.warn('[AUTH/GOOGLE] ⚠ Access token verification network error:', accessErr?.message || accessErr);
        return NextResponse.json(
          { error: 'Network error communicating with Google authentication servers.' },
          { status: 502 }
        );
      }
    } else {
      // Verification via Cryptographic JWT ID Token
      const token = (credential || idToken) as string;

      if (clientIds.length === 0) {
        console.error('[AUTH/GOOGLE] ❌ Missing GOOGLE_CLIENT_ID or NEXT_PUBLIC_GOOGLE_CLIENT_ID configuration on server.');
        return NextResponse.json(
          { error: 'Google Sign-In is temporarily unavailable. Please try again later.' },
          { status: 500 }
        );
      }

      const client = getOAuth2Client();
      let ticket;
      try {
        ticket = await client.verifyIdToken({
          idToken: token,
          audience: clientIds,
        });
      } catch (verifyErr: any) {
        console.warn('[AUTH/GOOGLE] ⚠ Google ID token verification failed:', verifyErr?.message || verifyErr);
        return NextResponse.json(
          { error: 'Invalid or expired Google authentication credential. Please try signing in again.' },
          { status: 401 }
        );
      }

      const payload = ticket.getPayload();
      if (!payload) {
        return NextResponse.json(
          { error: 'Failed to extract Google user profile from credential.' },
          { status: 401 }
        );
      }

      // Verify Issuer
      const validIssuers = ['accounts.google.com', 'https://accounts.google.com'];
      if (!payload.iss || !validIssuers.includes(payload.iss)) {
        console.warn('[AUTH/GOOGLE] ⚠ Invalid token issuer:', payload.iss);
        return NextResponse.json(
          { error: 'Invalid Google token issuer' },
          { status: 401 }
        );
      }

      // Verify Audience
      if (!payload.aud || !clientIds.includes(payload.aud as string)) {
        console.warn('[AUTH/GOOGLE] ⚠ Token audience mismatch:', payload.aud);
        return NextResponse.json(
          { error: 'Token audience does not match this application' },
          { status: 401 }
        );
      }

      // Verify Expiration
      const nowSeconds = Math.floor(Date.now() / 1000);
      if (!payload.exp || payload.exp < nowSeconds) {
        console.warn('[AUTH/GOOGLE] ⚠ Token expired at:', payload.exp, 'Current time:', nowSeconds);
        return NextResponse.json(
          { error: 'Google session token has expired. Please sign in again.' },
          { status: 401 }
        );
      }

      // Verify Email & Email Verified Status
      if (!payload.email || payload.email_verified !== true) {
        console.warn('[AUTH/GOOGLE] ⚠ Google email missing or unverified:', payload.email);
        return NextResponse.json(
          { error: 'Google account email is unverified. Please verify your email with Google first.' },
          { status: 403 }
        );
      }

      googleSub = sanitize(payload.sub);
      googleEmail = sanitize(payload.email.toLowerCase().trim());
      googleName = payload.name ? sanitize(payload.name) : googleEmail.split('@')[0];
      googlePicture = payload.picture ? sanitize(payload.picture) : null;
    }

    if (!googleSub || !googleEmail) {
      return NextResponse.json(
        { error: 'Invalid user details received from Google.' },
        { status: 400 }
      );
    }

    // 3. Synchronize User with PostgreSQL Database via Prisma
    const [userByUid, userByEmail] = await Promise.all([
      prisma.user.findUnique({ where: { id: googleSub } }),
      prisma.user.findUnique({ where: { email: googleEmail } }),
    ]);

    let user;
    let isNewUser = false;

    if (userByUid) {
      // User exists with this Google sub ID — update profile details while preserving role
      user = await prisma.user.update({
        where: { id: googleSub },
        data: {
          email: googleEmail,
          name: googleName || userByUid.name,
          image: googlePicture || userByUid.image,
        },
      });
    } else if (userByEmail) {
      // User exists by email with a different ID — migrate atomically to Google sub ID
      console.info(`[AUTH/GOOGLE] Migrating user ID (DB: ${userByEmail.id} → Google Sub: ${googleSub}). Preserving role: ${userByEmail.role}`);
      
      user = await prisma.$transaction(async (tx) => {
        const alreadyMigrated = await tx.user.findUnique({ where: { id: googleSub } });
        if (alreadyMigrated) return alreadyMigrated;

        const oldUser = await tx.user.findUnique({ where: { id: userByEmail.id } });
        if (!oldUser) {
          const fallback = await tx.user.findUnique({ where: { email: googleEmail } });
          if (fallback) return fallback;
          throw new Error('User migration source record disappeared.');
        }

        // 1. Temporarily change email of old user to release unique constraint
        const tempEmail = `${oldUser.email}_old_${Date.now()}`;
        await tx.user.update({
          where: { id: oldUser.id },
          data: { email: tempEmail },
        });

        // 2. Create the migrated user with Google sub as primary key
        const newUser = await tx.user.create({
          data: {
            id: googleSub,
            email: googleEmail,
            name: googleName || oldUser.name || 'Member',
            password: 'google-authenticated',
            role: oldUser.role || DEFAULT_ROLE,
            phone: oldUser.phone || null,
            address: oldUser.address || null,
            image: googlePicture || oldUser.image || null,
          },
        });

        // 3. Re-link foreign key records
        await tx.eventRegistration.updateMany({
          where: { userId: oldUser.id },
          data: { userId: googleSub },
        });
        await tx.prayerRequest.updateMany({
          where: { userId: oldUser.id },
          data: { userId: googleSub },
        });
        await tx.testimonial.updateMany({
          where: { userId: oldUser.id },
          data: { userId: googleSub },
        });
        await tx.donation.updateMany({
          where: { userId: oldUser.id },
          data: { userId: googleSub },
        });

        // 4. Clean up old user record
        await tx.user.delete({
          where: { id: oldUser.id },
        });

        return newUser;
      }, { timeout: 20000, maxWait: 10000 });
    } else {
      // New Google User
      isNewUser = true;
      user = await prisma.user.create({
        data: {
          id: googleSub,
          email: googleEmail,
          name: googleName,
          password: 'google-authenticated',
          role: DEFAULT_ROLE,
          image: googlePicture,
        },
      });
    }

    // 4. Admin Notification for New Registrations
    if (isNewUser) {
      try {
        const { createNotification } = await import('@/lib/notification');
        await createNotification({
          type: 'NEW_MEMBER',
          title: 'New Member via Google Sign-In',
          content: `${googleName} (${googleEmail}) signed in with Google.`,
          link: '/admin/members',
        });
      } catch (notifErr) {
        console.warn('[AUTH/GOOGLE] Notification creation notice:', notifErr);
      }
    }

    // 5. Determine Authorized Redirect Destination
    const normalizedRole = (user.role || DEFAULT_ROLE).toUpperCase();
    let redirectTo = '/member';
    if (normalizedRole === 'ADMIN' || normalizedRole === 'SUPER_ADMIN') {
      redirectTo = '/admin/dashboard';
    } else if (normalizedRole === 'PASTOR') {
      redirectTo = '/pastor/main/dashboard';
    } else if (normalizedRole === 'EVENT_MANAGER' || normalizedRole === 'FIELD_VOLUNTEER') {
      redirectTo = '/event-manager';
    }

    // 6. Establish Authenticated Session via Cookies
    const maxAge = 7 * 24 * 60 * 60; // 7 days
    const isHttps = req.headers.get('x-forwarded-proto') === 'https' || req.url.startsWith('https:');
    const isProd = process.env.NODE_ENV === 'production' || isHttps;

    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        image: user.image,
        role: user.role,
      },
      redirectTo,
    });

    response.cookies.set('__kcm_session_uid', user.id, {
      path: '/',
      maxAge,
      sameSite: 'lax',
      secure: isProd,
      httpOnly: false, // Accessible by client AuthProvider
    });

    response.cookies.set('__kcm_session_role', user.role, {
      path: '/',
      maxAge,
      sameSite: 'lax',
      secure: isProd,
      httpOnly: false,
    });

    return response;
  } catch (err: any) {
    console.error('[AUTH/GOOGLE] Server exception:', err);
    return NextResponse.json(
      { error: 'An unexpected authentication error occurred on the server. Please try again.' },
      { status: 500 }
    );
  }
}
