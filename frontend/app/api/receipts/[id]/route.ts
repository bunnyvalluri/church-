import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthenticatedUser } from '@/lib/authMiddleware';

export const dynamic = 'force-dynamic';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const id = params.id;
  const { searchParams } = new URL(req.url);
  const emailTrigger = searchParams.get('email') === 'true';

  try {
    if (!id) {
      return NextResponse.json({ error: 'Receipt ID is required.' }, { status: 400 });
    }

    // Fetch the receipt including related donation details
    const receipt = await prisma.receipt.findFirst({
      where: {
        OR: [
          { id },
          { receiptNumber: id },
          { donationId: id }
        ]
      },
      include: {
        donation: {
          include: {
            purposeRelation: true,
            branch: true,
          }
        },
        member: {
          select: {
            name: true,
            email: true,
            phone: true,
          }
        }
      }
    });

    if (!receipt) {
      return NextResponse.json({ error: 'Receipt record not found.' }, { status: 404 });
    }

    // Security check: Must be the recipient of the receipt or an administrator/staff
    const authUser = await getAuthenticatedUser(req);
    const devRole = process.env.NODE_ENV !== 'production'
      ? (process.env.NEXT_PUBLIC_DEV_AUTO_LOGIN?.toLowerCase() ?? '')
      : '';
    const isDevBypass = ['admin', 'super_admin', 'pastor'].includes(devRole);

    if (!isDevBypass) {
      if (!authUser) {
        return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });
      }

      const isAdmin = ['ADMIN', 'SUPER_ADMIN', 'PASTOR', 'BRANCH_MANAGER', 'MEDIA_TEAM'].includes(authUser.role);
      if (!isAdmin && receipt.memberId && authUser.uid !== receipt.memberId) {
        return NextResponse.json({ error: 'Forbidden: You do not have permission to view this receipt.' }, { status: 403 });
      }
    }

    // Trigger re-sending email in background if requested
    if (emailTrigger) {
      const donorEmail = receipt.donation.donorEmail || receipt.member?.email;
      if (donorEmail) {
        try {
          const { emailService } = await import('@/lib/email');
          const formattedAmount = receipt.amount.toLocaleString('en-IN', {
            minimumFractionDigits: 2,
            style: 'currency',
            currency: 'INR',
          });
          const formattedDate = new Date(receipt.issuedAt).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
          });

          await emailService.sendDonationReceipt(
            donorEmail,
            {
              email: donorEmail,
              donorName: receipt.donation.donorName || receipt.member?.name || 'Beloved Member',
              receiptNumber: receipt.receiptNumber,
              donationAmount: formattedAmount,
              transactionId: receipt.referenceNumber || receipt.receiptNumber,
              date: formattedDate,
              purpose: receipt.donation.purposeRelation?.nameEn || receipt.donation.purpose || 'General Church Fund',
              verificationCode: receipt.verificationCode,
              utr: receipt.referenceNumber || undefined,
              receiptUrl: `${process.env.NEXTAUTH_URL || 'https://kcmchurch.vercel.app'}/donations/receipts/${receipt.id}`,
              downloadPdfUrl: `${process.env.NEXTAUTH_URL || 'https://kcmchurch.vercel.app'}/api/receipts/${receipt.id}?download=true`,
            },
            receipt.id
          );
        } catch (emailErr: any) {
          console.warn('[RECEIPTS/EMAIL] Email dispatch error:', emailErr?.message);
        }
      }
    }

    return NextResponse.json({
      success: true,
      receipt: {
        id: receipt.id,
        receiptNumber: receipt.receiptNumber,
        donationId: receipt.donationId,
        member: receipt.donation.donorName || receipt.member?.name || 'Anonymous Giver',
        branch: receipt.donation.branch?.name || 'General',
        purpose: receipt.donation.purposeRelation?.nameEn || receipt.donation.purpose,
        amount: receipt.amount,
        currency: receipt.currency,
        issuedAt: receipt.issuedAt,
        referenceNumber: receipt.referenceNumber,
        verificationCode: receipt.verificationCode,
        qrCode: receipt.qrCode, // verification QR code base64
      }
    });
  } catch (err: any) {
    console.error('[API/RECEIPTS/GET] Error:', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
