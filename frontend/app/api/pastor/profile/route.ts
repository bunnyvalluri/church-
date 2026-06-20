import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Default values if database is empty
const defaultProfile = {
  name: "Bishop Kurra Kristhu Raju",
  title: "Senior Pastor & Founder",
  email: "bishop.kraju@kcmchurch.org",
  phone: "+91 95052 02748",
  bio: "Bishop Kurra Kristhu Raju has been serving in ministry with unwavering dedication. His passion for souls and commitment to God's Word has transformed countless lives across Hyderabad and beyond.",
  image: "/pastor.png"
};

export async function GET() {
  try {
    let pastor = await prisma.pastor.findFirst();
    if (!pastor) {
      // Create default pastor record in DB
      pastor = await prisma.pastor.create({
        data: defaultProfile
      });
    }
    return NextResponse.json({ success: true, profile: pastor });
  } catch (err: any) {
    console.error('[PASTOR/PROFILE/GET] Error:', err);
    return NextResponse.json(
      { error: err?.message || 'Database error occurred while fetching pastor profile' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, title, email, phone, bio, image } = body;

    if (!name || !title || !email || !phone) {
      return NextResponse.json({ error: 'Name, title, email, and phone are required' }, { status: 400 });
    }

    const profileData = {
      name,
      title,
      email,
      phone,
      bio: bio || "",
      image: image || "/pastor.png"
    };

    let pastor = await prisma.pastor.findFirst();
    if (pastor) {
      pastor = await prisma.pastor.update({
        where: { id: pastor.id },
        data: profileData
      });
    } else {
      pastor = await prisma.pastor.create({
        data: profileData
      });
    }

    return NextResponse.json({ success: true, profile: pastor });
  } catch (err: any) {
    console.error('[PASTOR/PROFILE/POST] Error:', err);
    return NextResponse.json(
      { error: err?.message || 'Database error occurred while updating pastor profile' },
      { status: 500 }
    );
  }
}

