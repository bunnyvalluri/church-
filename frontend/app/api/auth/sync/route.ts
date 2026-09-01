export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import sanitizeHtml from 'sanitize-html';
import { createServerSession, attachSessionCookie, verifyServerSession, SESSION_COOKIE_NAME } from '@/lib/session';
import { getClientIp } from '@/lib/apiResponse';
import { emailService } from '@/lib/email';
import { verifyFirebaseToken, isAdminReady } from '@/lib/firebaseAdmin';

// ── Validation Schema ────────────────────────────────────────────────────────
const syncSchema = z.object({
  uid: z.string().min(1).max(256).trim(),
  email: z.string().email().toLowerCase().trim().max(254),
  name: z.string().max(200).trim().optional().nullable(),
  photoURL: z.string().max(100000).trim().optional().nullable(),
  phoneNumber: z.string().max(50).trim().optional().nullable(),
  idToken: z.string().optional().nullable(),
});

// ── Sanitizer config ─────────────────────────────────────────────────────────
const sanitize = (s: string) =>
  sanitizeHtml(s, {
    allowedTags: [],
    allowedAttributes: {},
    disallowedTagsMode: 'discard',
  }).trim();

// ── Default Role Helper ──────────────────────────────────────────────────────
const DEFAULT_ROLE = 'MEMBER';

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);
    if (!body) {
      return NextResponse.json({ error: 'Invalid JSON payload' }, { status: 400 });
    }

    // 1. Validate Input using Zod Schema
    const parsed = syncSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid request data' }, { status: 400 });
    }

    const { uid, email, name, photoURL, phoneNumber, idToken } = parsed.data;

    // 2. Cryptographic Token Verification Check
    // If an Authorization Bearer header or idToken is present and Firebase Admin is ready, verify token
    const authHeader = req.headers.get('Authorization') ?? '';
    const bearerToken = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : (idToken || null);

    if (bearerToken && isAdminReady()) {
      const decoded = await verifyFirebaseToken(bearerToken);
      if (!decoded || (decoded.uid !== uid && decoded.email?.toLowerCase() !== email.toLowerCase())) {
        return NextResponse.json({ error: 'Invalid authentication token provided' }, { status: 401 });
      }
    }

    // 3. Sanitize Inputs
    const sanitizedUid = sanitize(uid);
    const sanitizedEmail = sanitize(email).toLowerCase();
    const sanitizedName = name ? sanitize(name) : null;
    const sanitizedPhotoURL = photoURL ? sanitize(photoURL) : null;
    const sanitizedPhoneNumber = phoneNumber ? sanitize(phoneNumber) : null;

    // 4. Sync with PostgreSQL database
    const [userByUid, userByEmail] = await Promise.all([
      prisma.user.findUnique({ where: { id: sanitizedUid } }),
      prisma.user.findUnique({ where: { email: sanitizedEmail } }),
    ]);

    let user;
    let isNewUser = false;

    if (userByUid) {
      if (
        userByUid.email !== sanitizedEmail ||
        (sanitizedName && userByUid.name !== sanitizedName) ||
        (sanitizedPhotoURL && userByUid.image !== sanitizedPhotoURL) ||
        (sanitizedPhoneNumber && userByUid.phone !== sanitizedPhoneNumber)
      ) {
        user = await prisma.user.update({
          where: { id: sanitizedUid },
          data: {
            email: sanitizedEmail,
            name: sanitizedName || userByUid.name,
            image: sanitizedPhotoURL || userByUid.image,
            phone: sanitizedPhoneNumber || userByUid.phone,
          },
        });
      } else {
        user = userByUid;
      }
    } else if (userByEmail) {
      user = await prisma.$transaction(async (tx) => {
        const txAlreadyMigrated = await tx.user.findUnique({
          where: { id: sanitizedUid },
        });
        if (txAlreadyMigrated) return txAlreadyMigrated;

        const oldUser = await tx.user.findUnique({
          where: { id: userByEmail.id },
        });
        if (!oldUser) {
          const fallback = await tx.user.findUnique({ where: { email: sanitizedEmail } });
          if (fallback) return fallback;
          throw new Error('User migration source record disappeared.');
        }

        const tempEmail = `${oldUser.email}_old_${Date.now()}`;
        await tx.user.update({
          where: { id: oldUser.id },
          data: { email: tempEmail },
        });

        const newUser = await tx.user.create({
          data: {
            id: sanitizedUid,
            email: sanitizedEmail,
            name: sanitizedName || oldUser.name || 'Member',
            password: 'firebase-authenticated',
            role: oldUser.role || DEFAULT_ROLE,
            phone: sanitizedPhoneNumber || oldUser.phone || null,
            address: oldUser.address || null,
            image: sanitizedPhotoURL || oldUser.image || null,
          },
        });

        await tx.eventRegistration.updateMany({
          where: { userId: oldUser.id },
          data: { userId: sanitizedUid },
        });
        await tx.prayerRequest.updateMany({
          where: { userId: oldUser.id },
          data: { userId: sanitizedUid },
        });
        await tx.testimonial.updateMany({
          where: { userId: oldUser.id },
          data: { userId: sanitizedUid },
        });
        await tx.donation.updateMany({
          where: { userId: oldUser.id },
          data: { userId: sanitizedUid },
        });

        await tx.user.delete({
          where: { id: oldUser.id },
        });

        return newUser;
      }, { timeout: 20000, maxWait: 10000 });
    } else {
      isNewUser = true;
      user = await prisma.user.create({
        data: {
          id: sanitizedUid,
          email: sanitizedEmail,
          name: sanitizedName || 'Member',
          password: 'firebase-authenticated',
          role: DEFAULT_ROLE,
          image: sanitizedPhotoURL || null,
          phone: sanitizedPhoneNumber || null,
        },
      });
    }

    if (isNewUser) {
      try {
        const { createNotification } = await import('@/lib/notification');
        await createNotification({
          type: 'NEW_MEMBER',
          title: 'New Member Registered',
          content: `${sanitizedName || 'A new member'} (${sanitizedEmail}) registered.`,
          link: '/admin/members',
        });
      } catch (notifErr) {
        console.warn('[AUTH/SYNC] Notification creation notice:', notifErr);
      }

      emailService
        .sendWelcomeEmail(
          sanitizedEmail,
          sanitizedName ? sanitizedName.split(' ')[0] : 'Member',
          undefined,
          user.id
        )
        .catch((err) => console.warn('[AUTH/SYNC] Welcome email dispatch notice:', err?.message));
    }

    // 5. Establish Server-Side Session in PostgreSQL with Secure HttpOnly Cookie
    const isHttps = req.headers.get('x-forwarded-proto') === 'https' || req.url.startsWith('https:');
    const isProd = process.env.NODE_ENV === 'production' || isHttps;
    const ip = getClientIp(req);
    const userAgent = req.headers.get('user-agent');

    const { token } = await createServerSession(user.id, user.role, {
      ip,
      userAgent,
      isHttps: isProd,
    });

    const res = NextResponse.json({ success: true, user });
    attachSessionCookie(res, token, isProd);

    // Clean up legacy presence cookies
    res.cookies.set('__kcm_session_uid', '', { path: '/', maxAge: 0 });
    res.cookies.set('__kcm_session_role', '', { path: '/', maxAge: 0 });

    return res;
  } catch (err: any) {
    console.error('[AUTH/SYNC] Error:', err);
    return NextResponse.json(
      { error: 'An error occurred during synchronization' },
      { status: 500 }
    );
  }
}
