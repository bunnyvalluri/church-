export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import sanitizeHtml from 'sanitize-html';
import { getClientIp } from '@/lib/apiResponse';
import { rateLimitHeaders, isRateLimited } from '@/lib/rateLimit';
import { emailService } from '@/lib/email';
import { logger } from '@/lib/logger';

// ── Rate Limit Configuration: 5 registration requests per 15 minutes per IP ────
const REG_RATE_LIMIT = { windowMs: 15 * 60 * 1000, maxRequests: 5 };

// ── Input Sanitizer ───────────────────────────────────────────────────────────
const sanitize = (s: string) =>
  sanitizeHtml(s, {
    allowedTags: [],
    allowedAttributes: {},
    disallowedTagsMode: 'discard',
  }).trim();

// ── Zod Registration Validation Schema ─────────────────────────────────────────
const registerSchema = z
  .object({
    firstName: z
      .string({ required_error: 'First name is required' })
      .min(1, 'First name is required')
      .max(50, 'First name cannot exceed 50 characters')
      .trim(),
    lastName: z
      .string({ required_error: 'Last name is required' })
      .min(1, 'Last name is required')
      .max(50, 'Last name cannot exceed 50 characters')
      .trim(),
    email: z
      .string({ required_error: 'Email address is required' })
      .email('Please enter a valid email address')
      .max(254, 'Email cannot exceed 254 characters')
      .toLowerCase()
      .trim(),
    phone: z
      .string()
      .max(30, 'Phone number cannot exceed 30 characters')
      .optional()
      .nullable(),
    password: z
      .string({ required_error: 'Password is required' })
      .min(8, 'Password must be at least 8 characters long')
      .max(128, 'Password cannot exceed 128 characters')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/[0-9]/, 'Password must contain at least one number')
      .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
    confirmPassword: z
      .string({ required_error: 'Confirm password is required' }),
    termsAccepted: z
      .boolean()
      .refine((val) => val === true, {
        message: 'You must accept the Terms of Service and Privacy Policy to register',
      }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export async function POST(req: Request) {
  const ip = getClientIp(req);
  const rlHeaders = rateLimitHeaders(ip, REG_RATE_LIMIT);

  // 1. IP-Based Rate Limiting Defense
  if (isRateLimited(ip, REG_RATE_LIMIT)) {
    logger.warn('[AUTH/REGISTER] Rate limit exceeded', { ip });
    return NextResponse.json(
      {
        error: 'Too many registration attempts from this network. Please wait a few minutes before trying again.',
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

    // 2. Server-Side Schema Validation
    const validationResult = registerSchema.safeParse(rawBody);
    if (!validationResult.success) {
      const firstError = validationResult.error.errors[0]?.message || 'Validation failed';
      return NextResponse.json(
        { error: firstError, details: validationResult.error.flatten().fieldErrors },
        { status: 400, headers: rlHeaders }
      );
    }

    const { firstName, lastName, email, phone, password } = validationResult.data;

    // 3. Sanitize inputs
    const sanitizedFirstName = sanitize(firstName);
    const sanitizedLastName = sanitize(lastName);
    const sanitizedEmail = sanitize(email).toLowerCase();
    const sanitizedPhone = phone ? sanitize(phone) : null;
    const fullName = `${sanitizedFirstName} ${sanitizedLastName}`.trim();

    // 4. Duplicate Account Check in PostgreSQL Database
    const existingUser = await prisma.user.findUnique({
      where: { email: sanitizedEmail },
      select: { id: true, email: true },
    });

    if (existingUser) {
      logger.info('[AUTH/REGISTER] Duplicate registration attempt', {
        email: sanitizedEmail,
        ip,
      });
      // Return safe, user-friendly error without exposing database internal structure
      return NextResponse.json(
        { error: 'An account with this email address already exists. Please sign in.' },
        { status: 409, headers: rlHeaders }
      );
    }

    // 5. Strong Password Hashing with bcryptjs (Work Factor: 12)
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // 6. Create Real User in PostgreSQL Database
    const newUser = await prisma.user.create({
      data: {
        name: fullName,
        email: sanitizedEmail,
        password: hashedPassword,
        role: 'MEMBER',
        phone: sanitizedPhone,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    logger.info('[AUTH/REGISTER] User successfully registered in database', {
      userId: newUser.id,
      email: newUser.email,
      role: newUser.role,
    });

    // 7. Non-blocking Welcome Email Dispatch
    emailService
      .sendWelcomeEmail(
        sanitizedEmail,
        sanitizedFirstName || 'Member',
        undefined,
        newUser.id
      )
      .catch((err) => {
        logger.warn('[AUTH/REGISTER] Welcome email dispatch notice:', {
          userId: newUser.id,
          error: err?.message,
        });
      });

    // 8. Non-blocking In-App Notification Recording for Administrators
    try {
      const { createNotification } = await import('@/lib/notification');
      await createNotification({
        type: 'NEW_MEMBER',
        title: 'New Member Registered',
        content: `${fullName} (${sanitizedEmail}) registered on the portal.`,
        link: '/admin/members',
      }).catch(() => null);
    } catch {
      // Ignored non-blocking
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Account created successfully. Please sign in.',
        user: {
          id: newUser.id,
          email: newUser.email,
          name: newUser.name,
          role: newUser.role,
        },
      },
      { status: 201, headers: rlHeaders }
    );
  } catch (err: any) {
    logger.error('[AUTH/REGISTER] Unexpected server error during registration', {
      error: err?.message || String(err),
      ip,
    });

    // Safe error message avoiding internal database/stack trace exposure
    return NextResponse.json(
      { error: 'An error occurred while creating your account. Please try again later.' },
      { status: 500, headers: rlHeaders }
    );
  }
}
