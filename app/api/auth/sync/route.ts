import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

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
      console.warn('[AUTH/SYNC] Database unavailable (Prisma/DB offline). Using local file fallback. Details:', dbError?.message || dbError);

      try {
        const fs = require('fs');
        const path = require('path');
        const fallbackDir = path.join(process.cwd(), 'prisma');
        const fallbackFile = path.join(fallbackDir, 'fallback_users.json');
        
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
        
        if (!fs.existsSync(fallbackDir)) {
          fs.mkdirSync(fallbackDir, { recursive: true });
        }
        fs.writeFileSync(fallbackFile, JSON.stringify(users, null, 2), 'utf-8');
        console.info(`[AUTH/SYNC/FALLBACK] ✅ Synced user ${email} locally in prisma/fallback_users.json`);

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
