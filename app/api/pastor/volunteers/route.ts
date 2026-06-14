import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import fs from 'fs';
import path from 'path';

// Seed initial mock volunteers
const initialVolunteers = [
  { id: "v_1", name: "Emily Davis", email: "emily.davis@gmail.com", phone: "+91 98765 43210", ministry: "Choir", status: "Pending", appliedAt: "2026-06-10" },
  { id: "v_2", name: "Michael Brown", email: "michael.b@email.com", phone: "+91 98480 22338", ministry: "Ushering", status: "Approved", appliedAt: "2026-06-08" },
  { id: "v_3", name: "Sarah Johnson", email: "sarah.johnson@yahoo.com", phone: "+91 96521 88776", ministry: "Sunday School", status: "Pending", appliedAt: "2026-06-11" },
  { id: "v_4", name: "Robert Taylor", email: "robert.t@outlook.com", phone: "+91 90001 54321", ministry: "Media & AV", status: "Approved", appliedAt: "2026-06-05" }
];

const getFallbackFile = () => path.join(process.cwd(), 'prisma', 'fallback_volunteers.json');

const readVolunteers = () => {
  const file = getFallbackFile();
  if (!fs.existsSync(file)) {
    fs.writeFileSync(file, JSON.stringify(initialVolunteers, null, 2), 'utf-8');
    return initialVolunteers;
  }
  try {
    return JSON.parse(fs.readFileSync(file, 'utf-8'));
  } catch (err) {
    console.error('Error reading volunteers file:', err);
    return initialVolunteers;
  }
};

const writeVolunteers = (volunteers: any[]) => {
  const file = getFallbackFile();
  fs.writeFileSync(file, JSON.stringify(volunteers, null, 2), 'utf-8');
};

export async function GET() {
  try {
    // Attempt DB first (if custom schema exists, otherwise JSON fallback)
    try {
      // Since no Volunteer model exists in schema.prisma, we use JSON fallback directly
      const volunteers = readVolunteers();
      return NextResponse.json({ success: true, volunteers });
    } catch (dbError) {
      const volunteers = readVolunteers();
      return NextResponse.json({ success: true, volunteers, warning: 'Using local storage' });
    }
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { id, status } = body;

    if (!id || !status) {
      return NextResponse.json({ error: 'Volunteer ID and status are required' }, { status: 400 });
    }

    const volunteers = readVolunteers();
    const volunteerIndex = volunteers.findIndex((v: any) => v.id === id);

    if (volunteerIndex === -1) {
      return NextResponse.json({ error: 'Volunteer not found' }, { status: 404 });
    }

    volunteers[volunteerIndex].status = status;
    writeVolunteers(volunteers);

    return NextResponse.json({ success: true, volunteer: volunteers[volunteerIndex] });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Internal Server Error' }, { status: 500 });
  }
}
