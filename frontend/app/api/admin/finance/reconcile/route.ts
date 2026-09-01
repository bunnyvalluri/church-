/**
 * /api/admin/finance/reconcile
 * ─────────────────────────────────────────────────────────────────────────────
 * Financial Reconciliation Service for KCM Finance Administrators.
 *
 * Capabilities:
 *  • GET: Scans recent transactions to detect status, amount, or gateway mismatches
 *  • POST: Safely reconciles verified gateway payments into the database with audit trail
 */

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdminOrDev } from '@/lib/authMiddleware';
import { getPaymentProvider, ReconciliationDiscrepancy } from '@/lib/payments';
import { completeDonationSession } from '@/lib/paymentService';
import { writeAuditLog } from '@/lib/auditLogger';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const auth = await requireAdminOrDev(req);
  if (auth instanceof NextResponse) return auth;

  try {
    const { searchParams } = new URL(req.url);
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '50')));

    // 1. Fetch pending & processing sessions within the past 7 days
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const pendingDonations = await prisma.donation.findMany({
      where: {
        createdAt: { gte: sevenDaysAgo },
        status: { in: ['PENDING', 'PROCESSING'] },
      },
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: { session: true },
    });

    const provider = getPaymentProvider('RAZORPAY');
    const discrepancies: ReconciliationDiscrepancy[] = [];

    // 2. Check each pending donation against the payment gateway
    for (const donation of pendingDonations) {
      const paymentId = donation.razorpayPaymentId;
      if (!paymentId) continue;

      try {
        const gatewayDetails = await provider.fetchPayment(paymentId);

        if (gatewayDetails) {
          const dbAmountPaise = Math.round(donation.amount * 100);

          if (gatewayDetails.status === 'captured' && donation.status !== 'COMPLETED') {
            discrepancies.push({
              donationId: donation.id,
              sessionId: donation.sessionId,
              providerOrderId: donation.razorpayOrderId,
              providerPaymentId: paymentId,
              dbStatus: donation.status,
              gatewayStatus: 'CAPTURED',
              dbAmount: donation.amount,
              gatewayAmountPaise: gatewayDetails.amountInPaise,
              discrepancyType: 'GATEWAY_PAID_DB_PENDING',
              suggestedAction: 'RECONCILE_CAPTURE',
            });
          } else if (gatewayDetails.status === 'failed' && donation.status !== 'FAILED') {
            discrepancies.push({
              donationId: donation.id,
              sessionId: donation.sessionId,
              providerOrderId: donation.razorpayOrderId,
              providerPaymentId: paymentId,
              dbStatus: donation.status,
              gatewayStatus: 'FAILED',
              dbAmount: donation.amount,
              gatewayAmountPaise: gatewayDetails.amountInPaise,
              discrepancyType: 'GATEWAY_FAILED_DB_COMPLETED',
              suggestedAction: 'MARK_FAILED',
            });
          } else if (gatewayDetails.amountInPaise !== dbAmountPaise) {
            discrepancies.push({
              donationId: donation.id,
              sessionId: donation.sessionId,
              providerOrderId: donation.razorpayOrderId,
              providerPaymentId: paymentId,
              dbStatus: donation.status,
              gatewayStatus: gatewayDetails.status.toUpperCase(),
              dbAmount: donation.amount,
              gatewayAmountPaise: gatewayDetails.amountInPaise,
              discrepancyType: 'AMOUNT_MISMATCH',
              suggestedAction: 'MANUAL_INVESTIGATION',
            });
          }
        }
      } catch (err) {
        console.warn(`[RECONCILIATION] Gateway lookup failed for ${paymentId}:`, err);
      }
    }

    return NextResponse.json({
      success: true,
      scannedCount: pendingDonations.length,
      discrepancyCount: discrepancies.length,
      discrepancies,
    });
  } catch (err: any) {
    console.error('[ADMIN/FINANCE/RECONCILE/GET] Error:', err);
    return NextResponse.json({ error: err?.message || 'Reconciliation scan failed' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const auth = await requireAdminOrDev(req);
  if (auth instanceof NextResponse) return auth;

  try {
    const body = await req.json();
    const { donationId, action, reason } = body;

    if (!donationId || !action) {
      return NextResponse.json({ error: 'donationId and action are required' }, { status: 400 });
    }

    const donation = await prisma.donation.findUnique({
      where: { id: donationId },
      include: { session: true },
    });

    if (!donation) {
      return NextResponse.json({ error: 'Donation not found' }, { status: 404 });
    }

    const provider = getPaymentProvider('RAZORPAY');

    if (action === 'RECONCILE_CAPTURE') {
      const paymentId = donation.razorpayPaymentId;
      if (!paymentId) {
        return NextResponse.json({ error: 'Cannot reconcile without gateway payment ID' }, { status: 400 });
      }

      // Authoritatively verify with gateway before making changes
      const gatewayDetails = await provider.fetchPayment(paymentId);
      if (!gatewayDetails || gatewayDetails.status !== 'captured') {
        return NextResponse.json(
          { error: `Gateway does not confirm captured status for payment ${paymentId}` },
          { status: 400 }
        );
      }

      if (donation.sessionId) {
        await completeDonationSession(
          donation.sessionId,
          paymentId,
          'admin_reconciled',
          { source: 'ADMIN_RECONCILIATION', adminId: (auth as any).user?.uid, reason }
        );
      } else {
        await prisma.donation.update({
          where: { id: donation.id },
          data: {
            status: 'COMPLETED',
            amountVerified: true,
            signatureVerified: true,
            verifiedBy: 'ADMIN_RECONCILIATION',
          },
        });
      }

      await writeAuditLog({
        userId: (auth as any).user?.uid || null,
        action: 'ADMIN_FINANCIAL_RECONCILIATION',
        details: `Admin reconciled donation ${donation.id} to COMPLETED. Payment ID: ${paymentId}. Reason: ${reason || 'Automated reconciliation'}`,
      });

      return NextResponse.json({
        success: true,
        message: `Donation ${donation.id} successfully reconciled to COMPLETED.`,
      });
    }

    if (action === 'MARK_FAILED') {
      await prisma.donation.update({
        where: { id: donation.id },
        data: { status: 'FAILED' },
      });

      if (donation.sessionId) {
        await prisma.donationSession.update({
          where: { id: donation.sessionId },
          data: { status: 'FAILED', paymentState: 'FAILED' },
        }).catch(() => {});
      }

      await writeAuditLog({
        userId: (auth as any).user?.uid || null,
        action: 'ADMIN_FINANCIAL_RECONCILIATION',
        details: `Admin marked donation ${donation.id} as FAILED. Reason: ${reason || 'Gateway reported failed'}`,
      });

      return NextResponse.json({
        success: true,
        message: `Donation ${donation.id} marked as FAILED.`,
      });
    }

    return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 });
  } catch (err: any) {
    console.error('[ADMIN/FINANCE/RECONCILE/POST] Error:', err);
    return NextResponse.json({ error: err?.message || 'Reconciliation action failed' }, { status: 500 });
  }
}
