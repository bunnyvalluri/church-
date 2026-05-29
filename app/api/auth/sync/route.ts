import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import fs from 'fs';
import path from 'path';

function getFallbackFilePath() {
  if (process.env.VERCEL || process.env.NODE_ENV === 'production') {
    return path.join('/tmp', 'fallback_users.json');
  }
  return path.join(process.cwd(), 'prisma', 'fallback_users.json');
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { uid, email, name, photoURL, phoneNumber } = body;

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // Try to sync with the database. Wrap in try/catch to handle connection/migration issues gracefully.
    try {
      const user = await prisma.user.upsert({
        where: { email },
        update: {}, // Keep existing user-modified profile details intact
        create: {
          id: uid, // Use Firebase UID as the primary key
          email,
          name: name || 'Member',
          password: 'firebase-authenticated', // Dummy placeholder to satisfy required schema constraint
          image: photoURL || null,
          phone: phoneNumber || null,
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
            const userDocRef = doc(db, 'users', uid);
            const userSnap = await getDoc(userDocRef);
            
            let fallbackUser;
            if (userSnap.exists()) {
              fallbackUser = userSnap.data();
            } else {
              fallbackUser = {
                id: uid,
                email,
                name: name || 'Member',
                image: photoURL || null,
                phone: phoneNumber || null,
                role: 'MEMBER',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              };
              await setDoc(userDocRef, fallbackUser);
            }
            
            console.info(`[AUTH/SYNC/FIRESTORE] ✅ Synced user ${email} directly to Cloud Firestore`);
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
        
        let existingUser = users.find((u: any) => u.email === email);
        let fallbackUser;
        
        if (existingUser) {
          // If the user already exists, preserve their updated profile details
          fallbackUser = existingUser;
        } else {
          fallbackUser = {
            id: uid,
            email,
            name: name || 'Member',
            image: photoURL || null,
            phone: phoneNumber || null,
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
        console.info(`[AUTH/SYNC/FALLBACK] ✅ Synced user ${email} locally in ${fallbackFile}`);

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
