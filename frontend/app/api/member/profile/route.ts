import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

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
    const { userId, name, phone, address, image } = body;

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const updateData: any = {
      name: name || 'Member',
      phone: phone || null,
      address: address || null,
    };
    if (image !== undefined) {
      updateData.image = image;
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
    });

    return NextResponse.json({ success: true, user: updatedUser });
  } catch (err: any) {
    console.error('[PROFILE/UPDATE] Error:', err);
    return NextResponse.json(
      { error: err?.message || 'Database error occurred while updating profile' },
      { status: 500 }
    );
  }
}


