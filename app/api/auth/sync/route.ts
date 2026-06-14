import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import sanitizeHtml from 'sanitize-html';

// ── Validation Schema ────────────────────────────────────────────────────────
const syncSchema = z.object({
  uid: z.string().min(5).max(128).trim().regex(/^[a-zA-Z0-9_\-\.\:\+]+$/),
  email: z.string().email().toLowerCase().trim().max(254),
  name: z.string().max(100).trim().optional().nullable(),
  photoURL: z.string().max(1000).trim().optional().nullable(),
  phoneNumber: z.string().max(30).trim().optional().nullable(),
});

// ── Sanitizer config ─────────────────────────────────────────────────────────
const sanitize = (s: string) =>
  sanitizeHtml(s, {
    allowedTags: [], // Strip all HTML tags
    allowedAttributes: {},
    disallowedTagsMode: 'discard',
  });

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // 1. Validate Input using Zod Schema
    const parsed = syncSchema.safeParse(body);
    if (!parsed.success) {
      console.warn('[AUTH/SYNC] ⚠ Validation failed for sync request:', parsed.error.format());
      return NextResponse.json({ error: 'Invalid request data' }, { status: 400 });
    }

    const { uid, email, name, photoURL, phoneNumber } = parsed.data;

    // 2. Sanitize Inputs to Block Injection and XSS Attacks
    const sanitizedUid = sanitize(uid);
    const sanitizedEmail = sanitize(email);
    const sanitizedName = name ? sanitize(name) : null;
    const sanitizedPhotoURL = photoURL ? sanitize(photoURL) : null;
    const sanitizedPhoneNumber = phoneNumber ? sanitize(phoneNumber) : null;

    // 3. Sync with the database
    const existingUserDb = await prisma.user.findUnique({
      where: { email: sanitizedEmail },
    });

    const user = await prisma.user.upsert({
      where: { email: sanitizedEmail },
      update: {}, // Keep existing user-modified profile details intact
      create: {
        id: sanitizedUid, // Use Firebase UID as the primary key
        email: sanitizedEmail,
        name: sanitizedName || 'Member',
        password: 'firebase-authenticated', // Dummy placeholder to satisfy required schema constraint
        image: sanitizedPhotoURL || null,
        phone: sanitizedPhoneNumber || null,
      },
    });

    if (!existingUserDb) {
      try {
        const { createNotification } = await import('@/lib/notification');
        await createNotification({
          type: 'NEW_MEMBER',
          title: 'New Member Registered',
          content: `${sanitizedName || 'A new member'} (${sanitizedEmail}) registered.`,
          link: 'members',
        });
      } catch (notifErr) {
        console.warn('[AUTH/SYNC] Notification creation failed:', notifErr);
      }
    }

    return NextResponse.json({ success: true, user });
  } catch (err: any) {
    console.error('[AUTH/SYNC] Error:', err);
    return NextResponse.json(
      { error: err?.message || 'Database error occurred during synchronization' },
      { status: 500 }
    );
  }
}

