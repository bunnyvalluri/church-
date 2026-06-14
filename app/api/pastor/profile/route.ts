import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import fs from 'fs';
import path from 'path';

// Seed initial mock profile
const defaultProfile = {
  name: "Bishop Kurra Kristhu Raju",
  title: "Senior Pastor & Founder",
  email: "bishop.kraju@kcmchurch.org",
  phone: "+91 95052 02748",
  bio: "Bishop Kurra Kristhu Raju has been serving in ministry with unwavering dedication. His passion for souls and commitment to God's Word has transformed countless lives across Hyderabad and beyond.",
  image: "/pastor.png"
};

const getFallbackFile = () => path.join(process.cwd(), 'prisma', 'fallback_pastor_profile.json');

const readPastorProfile = async () => {
  const file = getFallbackFile();
  const fsLib = require('fs');
  if (!fsLib.existsSync(file)) {
    fsLib.writeFileSync(file, JSON.stringify(defaultProfile, null, 2), 'utf-8');
    return defaultProfile;
  }
  try {
    return JSON.parse(fsLib.readFileSync(file, 'utf-8'));
  } catch (err) {
    console.error('Error reading pastor profile file:', err);
    return defaultProfile;
  }
};

const writePastorProfile = async (profile: any) => {
  const file = getFallbackFile();
  const fsLib = require('fs');
  fsLib.writeFileSync(file, JSON.stringify(profile, null, 2), 'utf-8');
};

export async function GET() {
  try {
    try {
      // Attempt database check
      const profile = await readPastorProfile();
      return NextResponse.json({ success: true, profile });
    } catch (dbError) {
      const profile = await readPastorProfile();
      return NextResponse.json({ success: true, profile, warning: 'Using local storage' });
    }
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, title, email, phone, bio, image } = body;

    if (!name || !title || !email || !phone) {
      return NextResponse.json({ error: 'Name, title, email, and phone are required' }, { status: 400 });
    }

    const profile = {
      name,
      title,
      email,
      phone,
      bio: bio || "",
      image: image || "/pastor.png"
    };

    await writePastorProfile(profile);

    return NextResponse.json({ success: true, profile });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Internal Server Error' }, { status: 500 });
  }
}
