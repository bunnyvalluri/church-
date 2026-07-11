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
        // Import resend helper dynamically and send email
        const resendKey = process.env.RESEND_API_KEY;
        if (resendKey) {
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

          const htmlBody = `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 12px;">
              <h2 style="color: #4F1C91; text-align: center;">✝ Kingdom of Christ Ministries</h2>
              <p style="text-align: center; color: #6b7280; font-size: 14px;">Duplicate Donation Receipt</p>
              <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;" />
              <p>Dear <strong>${receipt.donation.donorName || receipt.member?.name || 'Beloved Member'}</strong>,</p>
              <p>As requested, here is a duplicate copy of your official donation receipt.</p>
              <div style="background-color: #faf5ff; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
                  <tr>
                    <td style="padding: 6px 0; color: #6b7280;">Receipt Number:</td>
                    <td style="padding: 6px 0; font-weight: bold; text-align: right;">${receipt.receiptNumber}</td>
                  </tr>
                  <tr>
                    <td style="padding: 6px 0; color: #6b7280;">Verification Code:</td>
                    <td style="padding: 6px 0; font-family: monospace; text-align: right;">${receipt.verificationCode}</td>
                  </tr>
                  <tr>
                    <td style="padding: 6px 0; color: #6b7280;">Donation Purpose:</td>
                    <td style="padding: 6px 0; text-align: right; font-weight: 600;">${receipt.donation.purposeRelation?.nameEn || receipt.donation.purpose}</td>
                  </tr>
                  <tr>
                    <td style="padding: 6px 0; color: #6b7280;">Date:</td>
                    <td style="padding: 6px 0; text-align: right;">${formattedDate}</td>
                  </tr>
                  <tr>
                    <td style="padding: 6px 0; color: #6b7280;">UTR Ref:</td>
                    <td style="padding: 6px 0; text-align: right; font-family: monospace;">${receipt.referenceNumber}</td>
                  </tr>
                  <tr style="border-top: 1px solid #ede9fe;">
                    <td style="padding: 12px 0 0 0; font-size: 16px; font-weight: bold; color: #4F1C91;">Amount:</td>
                    <td style="padding: 12px 0 0 0; font-size: 18px; font-weight: 950; color: #4F1C91; text-align: right;">${formattedAmount}</td>
                  </tr>
                </table>
              </div>
            </div>
          `;

          await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${resendKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              from: 'KCM Donations <donations@kingdomofchristministries.org>',
              to: [donorEmail],
              subject: `Duplicate Receipt ${receipt.receiptNumber} — KCM`,
              html: htmlBody,
            }),
          });
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
