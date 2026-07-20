/**
 * POST /api/donations/admin-notify
 *
 * Manually triggers admin-team notification for a donation.
 * Used by admin panel and as fallback if the main flow missed it.
 */

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { notifyAdminTeam } from '@/lib/donationNotificationService';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { donationId } = body;

    if (!donationId) {
      return NextResponse.json({ error: 'donationId is required' }, { status: 400 });
    }

    const donation = await prisma.donation.findUnique({
      where: { id: donationId },
      include: {
        receipt: true,
        purposeRelation: true,
        branch: true,
      },
    });

    if (!donation) {
      return NextResponse.json({ error: 'Donation not found' }, { status: 404 });
    }

    const domain = process.env.NEXTAUTH_URL || 'http://localhost:3000';

    await notifyAdminTeam({
      donationId: donation.id,
      receiptId: donation.receipt?.id || '',
      receiptNumber: donation.receipt?.receiptNumber || '',
      verificationCode: donation.receipt?.verificationCode || '',
      donorName: donation.donorName || 'Anonymous Giver',
      donorEmail: donation.donorEmail || '',
      donorPhone: donation.donorPhone || '',
      isAnonymous: donation.donorName === 'Anonymous Giver',
      memberId: donation.userId,
      amount: donation.amount,
      currency: donation.currency,
      purpose: donation.purposeRelation?.nameEn || donation.purpose,
      purposeCode: donation.purpose,
      branchName: donation.branch?.name || 'General',
      paymentMethod: donation.paymentMethod || 'UPI',
      utr: donation.razorpayPaymentId || '',
      paidAt: donation.createdAt,
      receiptUrl: `${domain}/give/receipt/${donation.id}`,
      verifyUrl: `${domain}/give/receipt/${donation.id}?verify=${donation.receipt?.verificationCode}`,
    });

    return NextResponse.json({ success: true, message: 'Admin team notified.' });
  } catch (err: any) {
    console.error('[API/DONATIONS/ADMIN-NOTIFY]', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
