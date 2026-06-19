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
    // Find by ID first
    let userByUid = await prisma.user.findUnique({
      where: { id: sanitizedUid },
    });

    // Find by Email
    let userByEmail = await prisma.user.findUnique({
      where: { email: sanitizedEmail },
    });

    let user;
    let isNewUser = false;

    if (userByUid) {
      // User already exists with this Firebase UID.
      // If email has changed, update it.
      if (userByUid.email !== sanitizedEmail) {
        console.info(`[AUTH/SYNC] Email changed for UID ${sanitizedUid} (DB: ${userByUid.email}, Firebase: ${sanitizedEmail}). Updating email.`);
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
        // Just return the existing user (optionally updating name/photo/phone if they changed)
        user = userByUid;
      }
    } else if (userByEmail) {
      // User exists with this email but has a different ID (needs migration from local credentials / old ID to Firebase UID)
      console.info(`[AUTH/SYNC] User ID mismatch (DB: ${userByEmail.id}, Firebase: ${sanitizedUid}). Migrating user ID and preserving role: ${userByEmail.role}`);
      
      user = await prisma.$transaction(async (tx) => {
        // Check again inside transaction
        const txAlreadyMigrated = await tx.user.findUnique({
          where: { id: sanitizedUid },
        });
        if (txAlreadyMigrated) return txAlreadyMigrated;

        const oldUser = await tx.user.findUnique({
          where: { id: userByEmail.id },
        });
        if (!oldUser) {
          const fallback = (await tx.user.findUnique({ where: { email: sanitizedEmail } }));
          if (fallback) return fallback;
          throw new Error('User migration source record disappeared.');
        }

        // 1. Change email of old user to free it up
        const tempEmail = `${oldUser.email}_old_${Date.now()}`;
        await tx.user.update({
          where: { id: oldUser.id },
          data: { email: tempEmail },
        });

        // 2. Create the new user record
        const newUser = await tx.user.create({
          data: {
            id: sanitizedUid,
            email: sanitizedEmail,
            name: sanitizedName || oldUser.name || 'Member',
            password: 'firebase-authenticated',
            role: oldUser.role,
            phone: sanitizedPhoneNumber || oldUser.phone || null,
            address: oldUser.address || null,
            image: sanitizedPhotoURL || oldUser.image || null,
          },
        });

        // 3. Update related tables
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

        // 4. Delete old user
        await tx.user.delete({
          where: { id: oldUser.id },
        });

        return newUser;
      });
    } else {
      // Brand new user, create it
      isNewUser = true;
      user = await prisma.user.create({
        data: {
          id: sanitizedUid,
          email: sanitizedEmail,
          name: sanitizedName || 'Member',
          password: 'firebase-authenticated',
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

