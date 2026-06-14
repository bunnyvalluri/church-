import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import fs from 'fs';
import path from 'path';

// Seed initial mock member requests
const initialMemberRequests = [
  { id: "mr_1", name: "Emily Davis", email: "emily@davis.com", phone: "+91 98765 43210", type: "Membership", time: "2h ago", status: "New", avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&q=80" },
  { id: "mr_2", name: "Michael Brown", email: "michael@brown.com", phone: "+91 98480 22338", type: "Transfer", time: "5h ago", status: "New", avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&q=80" },
  { id: "mr_3", name: "Sarah Johnson", email: "sarah@johnson.com", phone: "+91 96521 88776", type: "Baptism", time: "1d ago", status: "Pending", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&q=80" },
  { id: "mr_4", name: "David Martinez", email: "david@martinez.com", phone: "+91 90001 54321", type: "Reinstatement", time: "2d ago", status: "Approved", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&q=80" }
];

const getFallbackFile = () => path.join(process.cwd(), 'prisma', 'fallback_member_requests.json');

const readMemberRequests = () => {
  const file = getFallbackFile();
  if (!fs.existsSync(file)) {
    fs.writeFileSync(file, JSON.stringify(initialMemberRequests, null, 2), 'utf-8');
    return initialMemberRequests;
  }
  try {
    return JSON.parse(fs.readFileSync(file, 'utf-8'));
  } catch (err) {
    console.error('Error reading member requests file:', err);
    return initialMemberRequests;
  }
};

const writeMemberRequests = (requests: any[]) => {
  const file = getFallbackFile();
  fs.writeFileSync(file, JSON.stringify(requests, null, 2), 'utf-8');
};

export async function GET() {
  try {
    try {
      const requests = readMemberRequests();
      return NextResponse.json({ success: true, requests });
    } catch (dbError) {
      const requests = readMemberRequests();
      return NextResponse.json({ success: true, requests, warning: 'Using local storage' });
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
      return NextResponse.json({ error: 'Request ID and status are required' }, { status: 400 });
    }

    const requests = readMemberRequests();
    const requestIndex = requests.findIndex((r: any) => r.id === id);

    if (requestIndex === -1) {
      return NextResponse.json({ error: 'Member request not found' }, { status: 404 });
    }

    requests[requestIndex].status = status;
    writeMemberRequests(requests);

    return NextResponse.json({ success: true, request: requests[requestIndex] });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Internal Server Error' }, { status: 500 });
  }
}
