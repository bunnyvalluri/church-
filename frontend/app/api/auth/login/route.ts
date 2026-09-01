export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import sanitizeHtml from 'sanitize-html';
import { createServerSession, attachSessionCookie } from '@/lib/session';
import { getClientIp } from '@/lib/apiResponse';
import { rateLimitHeaders, isRateLimited } from '@/lib/rateLimit';
import { emailService } from '@/lib/email';
import { logger } from '@/lib/logger';

// ── Rate Limit Configuration: 5 login attempts per 15 minutes per IP ──────────
const LOGIN_RATE_LIMIT = { windowMs: 15 * 60 * 1000, maxRequests: 5 };

// Dummy hash for constant-time comparison when email does not exist (prevents timing side-channel attacks)
const DUMMY_BCRYPT_HASH = '$2a$12$e8Y9nZvZJ27Z6b2jW9fHq.U8k8zH6a4L3j2h1g0f9e8d7c6b5a4s3';

// ── Input Sanitizer ───────────────────────────────────────────────────────────
const sanitize = (s: string) =>
  sanitizeHtml(s, {
    allowedTags: [],
    allowedAttributes: {},
    disallowedTagsMode: 'discard',
  }).trim();

// ── Zod Login Validation Schema ───────────────────────────────────────────────
const loginSchema = z.object({
  email: z
    .string({ required_error: 'Email address is required' })
    .email('Please enter a valid email address')
    .max(254, 'Email is too long')
    .toLowerCase()
    .trim(),
  password: z
    .string({ required_error: 'Password is required' })
    .min(1, 'Password is required')
    .max(128, 'Password is too long'),
});

export async function POST(req: Request) {
  const ip = getClientIp(req);
  const userAgent = req.headers.get('user-agent') || 'Unknown';
  const rlHeaders = rateLimitHeaders(ip, LOGIN_RATE_LIMIT);

  // 1. IP-Based Brute Force Defense / Rate Limiting
  if (isRateLimited(ip, LOGIN_RATE_LIMIT)) {
    logger.warn('[AUTH/LOGIN] Rate limit exceeded for IP', { ip });
    return NextResponse.json(
      {
        error: 'Too many failed login attempts. Please wait 15 minutes before trying again.',
      },
      { status: 429, headers: rlHeaders }
    );
  }

  try {
    const rawBody = await req.json().catch(() => null);
    if (!rawBody || typeof rawBody !== 'object') {
      return NextResponse.json(
        { error: 'Invalid JSON request payload' },
        { status: 400, headers: rlHeaders }
      );
    }

    // 2. Schema Validation
    const validationResult = loginSchema.safeParse(rawBody);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid email or password format' },
        { status: 400, headers: rlHeaders }
      );
    }

    const { email, password } = validationResult.data;
    const sanitizedEmail = sanitize(email).toLowerCase();

    // 3. User Lookup in PostgreSQL Database
    let user = await prisma.user.findUnique({
      where: { email: sanitizedEmail },
      select: {
        id: true,
        email: true,
        name: true,
        image: true,
        password: true,
        role: true,
      },
    });

    // Known portal accounts initial map for automatic provisioning and password upgrading
    const PORTAL_PROVISIONING: Record<string, { role: any; defaultPass: string; name: string }> = {
      'kingofchristministries23@gmail.com': { role: 'SUPER_ADMIN', defaultPass: 'rahul@0423', name: 'Pastor Samuel Valluri' },
      'admin@kcm-church.com': { role: 'ADMIN', defaultPass: 'rahul@0423', name: 'Admin Leader' },
      'pastor.kristhuraju@kcm-church.com': { role: 'PASTOR', defaultPass: 'pastor@2026', name: 'Pastor Kristhuraju' },
      'pastor.david@kcm-church.com': { role: 'PASTOR', defaultPass: 'pastor@2026', name: 'Pastor David' },
      'eventmanager@kcm-church.com': { role: 'EVENT_MANAGER', defaultPass: 'event-handle-2026', name: 'Event Manager' },
      'event-management@kcm-church.com': { role: 'EVENT_MANAGER', defaultPass: 'event-handle-2026', name: 'Event Manager' },
    };

    let isPasswordValid = false;

    if (user && user.password) {
      if (user.password.startsWith('$2a$') || user.password.startsWith('$2b$') || user.password.startsWith('$2y$')) {
        isPasswordValid = await bcrypt.compare(password, user.password);
      } else {
        // Legacy or unhashed password in database: check match and upgrade to bcrypt
        const provisionConfig = PORTAL_PROVISIONING[sanitizedEmail];
        if (password === user.password || (provisionConfig && password === provisionConfig.defaultPass)) {
          isPasswordValid = true;
          const newHashed = await bcrypt.hash(password, 12);
          await prisma.user.update({
            where: { id: user.id },
            data: { password: newHashed, role: provisionConfig ? provisionConfig.role : user.role },
          }).catch(() => {});
        } else {
          await bcrypt.compare(password, DUMMY_BCRYPT_HASH).catch(() => false);
        }
      }
    } else if (!user && PORTAL_PROVISIONING[sanitizedEmail]) {
      // Auto-provision initial portal account on first verified login
      const provision = PORTAL_PROVISIONING[sanitizedEmail];
      if (password === provision.defaultPass) {
        isPasswordValid = true;
        const hashed = await bcrypt.hash(password, 12);
        user = await prisma.user.create({
          data: {
            email: sanitizedEmail,
            name: provision.name,
            password: hashed,
            role: provision.role,
          },
          select: {
            id: true,
            email: true,
            name: true,
            image: true,
            password: true,
            role: true,
          },
        });
      } else {
        await bcrypt.compare(password, DUMMY_BCRYPT_HASH).catch(() => false);
      }
    } else {
      // User not found
      await bcrypt.compare(password, DUMMY_BCRYPT_HASH).catch(() => false);
    }

    // 4. Invalid Credentials Handling (Generic message to prevent account enumeration)
    if (!user || !isPasswordValid) {
      logger.warn('[AUTH/LOGIN] Failed authentication attempt', {
        email: sanitizedEmail,
        ip,
      });

      return NextResponse.json(
        { error: 'Invalid email or password.' },
        { status: 401, headers: rlHeaders }
      );
    }

    // 5. Establish Server-Side Session in PostgreSQL
    const isHttps =
      req.headers.get('x-forwarded-proto') === 'https' || req.url.startsWith('https:');
    const isProd = process.env.NODE_ENV === 'production' || isHttps;

    const { token } = await createServerSession(user.id, user.role, {
      ip,
      userAgent,
      isHttps: isProd,
    });

    // 6. Determine Authorized Destination Path
    const normalizedRole = (user.role || 'MEMBER').toUpperCase();
    let redirectTo = '/member';
    switch (normalizedRole) {
      case 'ADMIN':
      case 'SUPER_ADMIN':
        redirectTo = '/admin/dashboard';
        break;
      case 'PASTOR':
        redirectTo = '/pastor/main/dashboard';
        break;
      case 'EVENT_MANAGER':
      case 'FIELD_VOLUNTEER':
        redirectTo = '/event-manager';
        break;
      default:
        redirectTo = '/member';
        break;
    }

    // 7. Non-blocking Security Login Email Notification
    const loginDateTime =
      new Date().toLocaleString('en-IN', {
        timeZone: 'Asia/Kolkata',
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      }) + ' IST';

    emailService
      .sendLoginNotification(
        user.email,
        user.name,
        {
          loginDateTime,
          loginMethod: 'Email & Password',
          device: userAgent.includes('Mobile') ? 'Mobile Device' : 'Desktop Browser',
          browser: userAgent.slice(0, 60),
          ipAddress: ip,
        },
        user.id
      )
      .catch((err) => {
        logger.warn('[AUTH/LOGIN] Login notification dispatch note:', {
          userId: user.id,
          error: err?.message,
        });
      });

    // 8. Assemble Authenticated Response with HttpOnly Cookie
    const res = NextResponse.json({
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

    attachSessionCookie(res, token, isProd);

    // Erase legacy client presence cookies
    res.cookies.set('__kcm_session_uid', '', { path: '/', maxAge: 0 });
    res.cookies.set('__kcm_session_role', '', { path: '/', maxAge: 0 });

    logger.info('[AUTH/LOGIN] User successfully authenticated and session created', {
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    return res;
  } catch (err: any) {
    logger.error('[AUTH/LOGIN] Unexpected server exception during login', {
      error: err?.message || String(err),
      ip,
    });

    return NextResponse.json(
      { error: 'An unexpected authentication error occurred on the server. Please try again.' },
      { status: 500, headers: rlHeaders }
    );
  }
}
