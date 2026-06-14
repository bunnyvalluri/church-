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

    let user;
    if (existingUserDb) {
      if (existingUserDb.id !== sanitizedUid) {
        // Check if another parallel call has already created the new user
        const alreadyMigrated = await prisma.user.findUnique({
          where: { id: sanitizedUid },
        });
        if (alreadyMigrated) {
          user = alreadyMigrated;
        } else {
          console.info(`[AUTH/SYNC] User ID mismatch (DB: ${existingUserDb.id}, Firebase: ${sanitizedUid}). Migrating user ID and preserving role: ${existingUserDb.role}`);
          
          user = await prisma.$transaction(async (tx) => {
            // Check again inside the transaction to avoid race conditions
            const txAlreadyMigrated = await tx.user.findUnique({
              where: { id: sanitizedUid },
            });
            if (txAlreadyMigrated) {
              return txAlreadyMigrated;
            }

            // Verify the old user record still exists
            const oldUser = await tx.user.findUnique({
              where: { id: existingUserDb.id },
            });
            if (!oldUser) {
              const fallbackUser = (await tx.user.findUnique({ where: { id: sanitizedUid } }))
                || (await tx.user.findUnique({ where: { email: sanitizedEmail } }));
              if (fallbackUser) return fallbackUser;
              throw new Error('User migration source record disappeared.');
            }

            // 1. Temporarily change the email of the old user to free up the unique constraint
            const tempEmail = `${oldUser.email}_old_${Date.now()}`;
            await tx.user.update({
              where: { id: oldUser.id },
              data: { email: tempEmail },
            });

            // 2. Create the new user record with the Firebase UID and correct email
            const newUser = await tx.user.upsert({
              where: { id: sanitizedUid },
              update: {
                role: oldUser.role, // Preserve role!
                name: sanitizedName || oldUser.name,
                phone: sanitizedPhoneNumber || oldUser.phone,
                address: oldUser.address,
                image: sanitizedPhotoURL || oldUser.image,
              },
              create: {
                id: sanitizedUid,
                email: sanitizedEmail,
                name: sanitizedName || oldUser.name || 'Member',
                password: 'firebase-authenticated',
                role: oldUser.role, // Preserve role!
                phone: sanitizedPhoneNumber || oldUser.phone || null,
                address: oldUser.address || null,
                image: sanitizedPhotoURL || oldUser.image || null,
              },
            });

            // 3. Update related tables to reference the new Firebase UID
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

            // 4. Delete the old user record
            await tx.user.delete({
              where: { id: oldUser.id },
            });

            return newUser;
          });
        }
      } else {
        // IDs match, just return existing user
        user = existingUserDb;
      }
    } else {
      // User doesn't exist, create a new record
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

