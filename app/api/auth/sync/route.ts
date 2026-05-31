import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import sanitizeHtml from 'sanitize-html';
import fs from 'fs';
import path from 'path';

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

function getFallbackFilePath() {
  if (process.env.VERCEL || process.env.NODE_ENV === 'production') {
    return path.join('/tmp', 'fallback_users.json');
  }
  return path.join(process.cwd(), 'prisma', 'fallback_users.json');
}

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

    // 3. Try to sync with the database. Wrap in try/catch to handle connection/migration issues.
    try {
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

      return NextResponse.json({ success: true, user });
    } catch (dbError: any) {
      console.warn('[AUTH/SYNC] Database unavailable (Prisma/DB offline). Trying Firestore or local file fallback. Details:', dbError?.message || dbError);

      try {
        const { db } = await import('@/lib/firebase');
        if (db && process.env.FIRESTORE_OFFLINE !== 'true') {
          try {
            const { doc, setDoc, getDoc } = await import('firebase/firestore');
            const userDocRef = doc(db, 'users', sanitizedUid);
            const userSnap = await getDoc(userDocRef);
            
            let fallbackUser;
            if (userSnap.exists()) {
              fallbackUser = userSnap.data();
            } else {
              fallbackUser = {
                id: sanitizedUid,
                email: sanitizedEmail,
                name: sanitizedName || 'Member',
                image: sanitizedPhotoURL || null,
                phone: sanitizedPhoneNumber || null,
                role: 'MEMBER',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              };
              await setDoc(userDocRef, fallbackUser);
            }
            
            console.info(`[AUTH/SYNC/FIRESTORE] ✅ Synced user ${sanitizedEmail} directly to Cloud Firestore`);
            return NextResponse.json({
              success: true,
              user: fallbackUser,
              warning: 'Database offline. User saved directly to Firebase Firestore.',
            });
          } catch (firestoreError: any) {
            console.warn('[AUTH/SYNC/FIRESTORE] Firestore fallback failed, resorting to local file. Details:', firestoreError?.message || firestoreError);
          }
        }

        const fallbackFile = getFallbackFilePath();
        
        let users = [];
        if (fs.existsSync(fallbackFile)) {
          try {
            users = JSON.parse(fs.readFileSync(fallbackFile, 'utf-8'));
          } catch {}
        }
        
        let existingUser = users.find((u: any) => u.email === sanitizedEmail);
        let fallbackUser;
        
        if (existingUser) {
          // If the user already exists, preserve their updated profile details
          fallbackUser = existingUser;
        } else {
          fallbackUser = {
            id: sanitizedUid,
            email: sanitizedEmail,
            name: sanitizedName || 'Member',
            image: sanitizedPhotoURL || null,
            phone: sanitizedPhoneNumber || null,
            role: 'MEMBER',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          users.push(fallbackUser);
        }
        
        // Ensure directories exist
        const dir = path.dirname(fallbackFile);
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir, { recursive: true });
        }
        
        fs.writeFileSync(fallbackFile, JSON.stringify(users, null, 2), 'utf-8');
        console.info(`[AUTH/SYNC/FALLBACK] ✅ Synced user ${sanitizedEmail} locally in ${fallbackFile}`);

        return NextResponse.json({
          success: true,
          user: fallbackUser,
          warning: 'Database offline or not migrated. User saved to local fallback file.',
        });
      } catch (fsErr) {
        console.error('[AUTH/SYNC] ❌ Local fallback failed:', fsErr);
        return NextResponse.json({
          success: false,
          warning: 'Database offline and local fallback failed. User authenticated on client only.',
          details: dbError?.message || String(dbError),
        });
      }
    }
  } catch (err: any) {
    console.error('[AUTH/SYNC] Parsing/internal error:', err);
    return NextResponse.json({ error: err?.message || 'Internal Server Error' }, { status: 500 });
  }
}
