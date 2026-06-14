import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Default values if database is empty
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

export async function GET() {
  try {
    let settings = await prisma.churchSettings.findUnique({
      where: { id: 'settings' }
    });

    if (!settings) {
      settings = await prisma.churchSettings.create({
        data: {
          id: 'settings',
          ...defaultSettings
        }
      });
    }

    return NextResponse.json({ success: true, settings });
  } catch (err: any) {
    console.error('[PASTOR/CHURCH-SETTINGS/GET] Error:', err);
    return NextResponse.json(
      { error: err?.message || 'Database error occurred while fetching church settings' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { churchName, tagline, primaryEmail, contactPhone, address, worshipServices, bilingualSupport, visitorRegistrationEnabled } = body;

    if (!churchName || !primaryEmail || !contactPhone || !address) {
      return NextResponse.json({ error: 'Required fields are missing' }, { status: 400 });
    }

    const settingsData = {
      churchName,
      tagline: tagline || "",
      primaryEmail,
      contactPhone,
      address,
      worshipServices: worshipServices || "Sundays at 10:00 AM",
      bilingualSupport: !!bilingualSupport,
      visitorRegistrationEnabled: !!visitorRegistrationEnabled
    };

    const settings = await prisma.churchSettings.upsert({
      where: { id: 'settings' },
      update: settingsData,
      create: {
        id: 'settings',
        ...settingsData
      }
    });

    return NextResponse.json({ success: true, settings });
  } catch (err: any) {
    console.error('[PASTOR/CHURCH-SETTINGS/POST] Error:', err);
    return NextResponse.json(
      { error: err?.message || 'Database error occurred while updating church settings' },
      { status: 500 }
    );
  }
}

