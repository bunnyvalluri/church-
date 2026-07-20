import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getOrCreateReceipt, renderReceiptHtml } from '@/lib/receiptEngine';

export const dynamic = 'force-dynamic';

export async function GET(
  req: Request,
  { params }: { params: { donationId: string } }
) {
  const { donationId } = params;
  const { searchParams } = new URL(req.url);
  const format = searchParams.get('format'); // 'html' | 'json'

  if (!donationId) {
    return NextResponse.json({ error: 'Donation ID is required' }, { status: 400 });
  }

  try {
    const donation = await prisma.donation.findUnique({
      where: { id: donationId },
      include: {
        user: {
          select: {
            name: true,
            email: true,
            phone: true,
          },
        },
        purposeRelation: true,
        branch: true,
        receipt: true,
      },
    });

    if (!donation) {
      return NextResponse.json({ error: 'Donation record not found' }, { status: 404 });
    }

    const donorName = donation.donorName || donation.user?.name || 'Valued Partner';
    const donorEmail = donation.donorEmail || donation.user?.email || undefined;
    const donorPhone = donation.donorPhone || donation.user?.phone || undefined;
    const purposeName = donation.purposeRelation?.nameEn || donation.purpose;
    const branchName = donation.branch?.name || undefined;

    const receipt = await getOrCreateReceipt({
      donationId: donation.id,
      donorName,
      donorEmail,
      donorPhone,
      panNumber: donation.panNumber || undefined,
      amount: donation.amount,
      currency: donation.currency,
      purposeName,
      branchName,
      paymentMethod: donation.paymentMethod,
      razorpayPaymentId: donation.razorpayPaymentId || undefined,
      razorpayOrderId: donation.razorpayOrderId || undefined,
      issuedAt: donation.createdAt,
    });

    if (format === 'html') {
      const html = renderReceiptHtml({
        receiptNumber: receipt.receiptNumber,
        verificationCode: receipt.verificationCode,
        donorName,
        donorEmail,
        donorPhone,
        panNumber: donation.panNumber || undefined,
        amount: donation.amount,
        currency: donation.currency,
        purposeName,
        branchName,
        paymentMethod: donation.paymentMethod,
        razorpayPaymentId: donation.razorpayPaymentId || undefined,
        qrCodeDataUrl: receipt.qrCodeDataUrl,
        issuedAt: donation.createdAt,
      });

      return new Response(html, {
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
        },
      });
    }

    return NextResponse.json({
      success: true,
      donation,
      receipt,
    });
  } catch (dbError: any) {
    console.error(`[DONATION/RECEIPT] Database error for ${donationId}:`, dbError);
    return NextResponse.json(
      { error: dbError?.message || 'Database error occurred while fetching donation receipt' },
      { status: 500 }
    );
  }
}
