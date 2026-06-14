import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import fs from 'fs';
import path from 'path';

// Seed initial mock settings
const defaultSettings = {
  churchName: "Kingdom of Christ Ministries",
  tagline: "Grace Community Sanctuary",
  primaryEmail: "info@kcmchurch.org",
  contactPhone: "+91 40 2345 6789",
  address: "Subhash Nagar Colony, Jeedimetla, Hyderabad, Telangana - 500055",
  worshipServices: "Sundays at 10:00 AM, 12:30 PM & 6:00 PM",
  bilingualSupport: true,
  visitorRegistrationEnabled: true
};

const getFallbackFile = () => path.join(process.cwd(), 'prisma', 'fallback_church_settings.json');

const readChurchSettings = () => {
  const file = getFallbackFile();
  if (!fs.existsSync(file)) {
    fs.writeFileSync(file, JSON.stringify(defaultSettings, null, 2), 'utf-8');
    return defaultSettings;
  }
  try {
    return JSON.parse(fs.readFileSync(file, 'utf-8'));
  } catch (err) {
    console.error('Error reading church settings file:', err);
    return defaultSettings;
  }
};

const writeChurchSettings = (settings: any) => {
  const file = getFallbackFile();
  fs.writeFileSync(file, JSON.stringify(settings, null, 2), 'utf-8');
};

export async function GET() {
  try {
    try {
      const settings = readChurchSettings();
      return NextResponse.json({ success: true, settings });
    } catch (dbError) {
      const settings = readChurchSettings();
      return NextResponse.json({ success: true, settings, warning: 'Using local storage' });
    }
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { churchName, tagline, primaryEmail, contactPhone, address, worshipServices, bilingualSupport, visitorRegistrationEnabled } = body;

    if (!churchName || !primaryEmail || !contactPhone || !address) {
      return NextResponse.json({ error: 'Required fields are missing' }, { status: 400 });
    }

    const settings = {
      churchName,
      tagline: tagline || "",
      primaryEmail,
      contactPhone,
      address,
      worshipServices: worshipServices || "Sundays at 10:00 AM",
      bilingualSupport: !!bilingualSupport,
      visitorRegistrationEnabled: !!visitorRegistrationEnabled
    };

    writeChurchSettings(settings);

    return NextResponse.json({ success: true, settings });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Internal Server Error' }, { status: 500 });
  }
}
