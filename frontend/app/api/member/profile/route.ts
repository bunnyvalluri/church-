import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    const email = searchParams.get('email');

    if (!userId && !email) {
      return NextResponse.json({ error: 'User ID or Email is required' }, { status: 400 });
    }

    let user = null;
    if (userId) {
      user = await prisma.user.findUnique({ where: { id: userId } });
    }
    if (!user && email) {
      user = await prisma.user.findUnique({ where: { email } });
    }

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, user });
  } catch (err: any) {
    console.error('[PROFILE/GET] Error:', err);
    return NextResponse.json(
      { error: err?.message || 'Database error occurred while fetching profile' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { userId, email, name, phone, address, image } = body;

    if (!userId && !email) {
      return NextResponse.json({ error: 'User ID or Email is required' }, { status: 400 });
    }

    // Find existing user by ID or Email
    let existingUser = null;
    if (userId) {
      existingUser = await prisma.user.findUnique({ where: { id: userId } });
    }
    if (!existingUser && email) {
      existingUser = await prisma.user.findUnique({ where: { email: email.toLowerCase().trim() } });
    }

    const updateData: any = {
      name: name || 'Member',
      phone: phone || null,
      address: address || null,
    };
    if (image !== undefined && image !== null) {
      updateData.image = image;
    }

    let updatedUser;
    if (existingUser) {
      updatedUser = await prisma.user.update({
        where: { id: existingUser.id },
        data: updateData,
      });
    } else {
      // Create user if not present in DB
      updatedUser = await prisma.user.create({
        data: {
          id: userId || undefined,
          email: (email || `${userId}@kcm-church.com`).toLowerCase().trim(),
          name: name || 'Member',
          password: '',
          phone: phone || null,
          address: address || null,
          image: image || null,
          role: 'MEMBER',
        },
      });
    }

    return NextResponse.json({ success: true, user: updatedUser });
  } catch (err: any) {
    console.error('[PROFILE/UPDATE] Error:', err);
    return NextResponse.json(
      { error: err?.message || 'Failed to update profile in database' },
      { status: 500 }
    );
  }
}
