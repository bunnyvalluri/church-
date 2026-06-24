import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { promises as fs } from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const visits = await prisma.memberRequest.findMany({
      where: { 
        email,
        type: 'Visit'
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({ success: true, visits });
  } catch (err: any) {
    console.error('[MEMBER/VISITS/GET] Error:', err);
    return NextResponse.json(
      { error: err?.message || 'Database error occurred while fetching visit requests' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { userId, name, email, phone, time, avatar } = body;

    if (!userId || !name || !email || !time) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    let relativeUrl = null;

    if (avatar) {
      const { validateFileSecurity } = await import('@/lib/uploadSecurity');
      const uploadDir = path.join(process.cwd(), 'public', 'uploads');
      await fs.mkdir(uploadDir, { recursive: true });

      const mimeExtensions: Record<string, string> = {
        'image/jpeg': '.jpg',
        'image/jpg': '.jpg',
        'image/png': '.png',
        'image/webp': '.webp'
      };

      const matches = avatar.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
      if (!matches || matches.length !== 3) {
        return NextResponse.json({ error: 'Invalid passport photo base64 payload' }, { status: 400 });
      }

      const mimeType = matches[1];
      const buffer = Buffer.from(matches[2], 'base64');
      const ext = mimeExtensions[mimeType] || '.jpg';
      const filename = `visit-${userId}-${Date.now()}${ext}`;
      relativeUrl = `/uploads/${filename}`;
      const absolutePath = path.join(uploadDir, filename);

      // Perform security check (magic numbers, Spoofing check, Size check)
      const securityCheck = validateFileSecurity(buffer, filename, mimeType);
      if (!securityCheck.isValid) {
        return NextResponse.json({ error: `Security validation failed: ${securityCheck.error}` }, { status: 400 });
      }

      // Write to local directory
      await fs.writeFile(absolutePath, buffer);
    }

    // Create the MemberRequest record in database
    const visitRequest = await prisma.memberRequest.create({
      data: {
        name,
        email,
        phone: phone || null,
        type: 'Visit',
        time,
        avatar: relativeUrl,
        status: 'New'
      }
    });

    // Create Notification item for Admins/Pastors
    try {
      const { createNotification } = await import('@/lib/notification');
      await createNotification({
        type: 'NEW_MEMBER',
        title: 'New Visit Request',
        content: `${name} has registered a visit request for ${time}.`,
        link: 'members',
      });
    } catch (notifErr) {
      console.warn('[MEMBER/VISITS/POST] Notification creation failed:', notifErr);
    }

    // Trigger Express real-time server webhook if active
    try {
      await fetch('http://localhost:3001/api/trigger-event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'new_member_request',
          payload: {
            id: visitRequest.id,
            name,
            type: 'Visit',
            time
          }
        })
      });
    } catch (wsErr) {
      // Bypassed if server offline
    }

    return NextResponse.json({ success: true, request: visitRequest });
  } catch (err: any) {
    console.error('[MEMBER/VISITS/POST] Error:', err);
    return NextResponse.json(
      { error: err?.message || 'Database error occurred while submitting visit request' },
      { status: 500 }
    );
  }
}
