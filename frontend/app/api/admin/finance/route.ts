import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdminOrDev } from '@/lib/authMiddleware';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const auth = await requireAdminOrDev(req);
  if (auth instanceof NextResponse) return auth;

  try {
    const [donations, pledges, transactions, accounts, users] = await Promise.all([
      prisma.donation.findMany({
        orderBy: { createdAt: 'desc' },
        take: 100,
        select: {
          id: true,
          donorName: true,
          donorEmail: true,
          amount: true,
          purpose: true,
          paymentMethod: true,
          razorpayPaymentId: true,
          stripeId: true,
          status: true,
          createdAt: true,
        },
      }),
      prisma.pledge.findMany({
        orderBy: { createdAt: 'desc' },
        take: 100,
        select: {
          id: true,
          donorName: true,
          donorEmail: true,
          committedAmount: true,
          paidAmount: true,
          targetDate: true,
          purpose: true,
          status: true,
          createdAt: true,
        },
      }),
      prisma.transaction.findMany({
        orderBy: { date: 'desc' },
        take: 100,
        select: {
          id: true,
          type: true,
          amount: true,
          category: true,
          description: true,
          date: true,
          account: true,
        },
      }),
      prisma.account.findMany({
        orderBy: { name: 'asc' },
        select: {
          id: true,
          name: true,
          balance: true,
          description: true,
        },
      }),
      prisma.user.findMany({
        take: 50,
        select: {
          id: true,
          name: true,
          email: true,
        },
      }),
    ]);

    return NextResponse.json({
      success: true,
      donations,
      pledges,
      transactions,
      accounts,
      users,
    });
  } catch (err: any) {
    console.error('[ADMIN/FINANCE/GET] Error:', err);
    return NextResponse.json(
      { error: err?.message || 'Database error occurred' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  const auth = await requireAdminOrDev(req);
  if (auth instanceof NextResponse) return auth;

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    const type = (searchParams.get('type') || 'donation').toLowerCase();

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    if (type === 'pledge') {
      try {
        await prisma.pledge.delete({ where: { id } });
      } catch (err: any) {
        if (err?.code !== 'P2025') throw err;
      }
    } else if (type === 'transaction') {
      try {
        await prisma.transaction.delete({ where: { id } });
      } catch (err: any) {
        if (err?.code !== 'P2025') throw err;
      }
    } else if (type === 'account') {
      try {
        await prisma.account.delete({ where: { id } });
      } catch (err: any) {
        if (err?.code !== 'P2025') throw err;
      }
    } else {
      // default: donation
      try {
        await prisma.donation.delete({ where: { id } });
      } catch (err: any) {
        if (err?.code !== 'P2025') throw err;
      }
    }

    return NextResponse.json({ success: true, message: 'Record deleted permanently' });
  } catch (err: any) {
    console.error('[ADMIN/FINANCE/DELETE] Error:', err);
    return NextResponse.json(
      { error: err?.message || 'Database error while deleting record' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  const auth = await requireAdminOrDev(req);
  if (auth instanceof NextResponse) return auth;

  try {
    const body = await req.json();
    const type = (body.entityType || body.type || 'donation').toLowerCase();

    if (type === 'pledge') {
      const { donorName, donorEmail, committedAmount, targetDate, purpose, status } = body;
      const pledge = await prisma.pledge.create({
        data: {
          donorName: donorName || 'Church Member',
          donorEmail: donorEmail || 'pledger@email.com',
          committedAmount: parseFloat(committedAmount || '0'),
          targetDate: targetDate ? new Date(targetDate) : new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
          purpose: purpose || 'BUILDING',
          status: status || 'ACTIVE',
        },
      });
      return NextResponse.json({ success: true, pledge });
    }

    if (type === 'transaction') {
      const { txType, amount, category, description, account, date } = body;
      const transaction = await prisma.transaction.create({
        data: {
          type: (txType || body.type || 'OUTFLOW') as any,
          amount: parseFloat(amount || '0'),
          category: category || 'GENERAL',
          description: description || 'Ledger transaction',
          account: account || 'General Fund',
          date: date ? new Date(date) : new Date(),
        },
      });
      return NextResponse.json({ success: true, transaction });
    }

    if (type === 'account') {
      const { name, balance, description } = body;
      const account = await prisma.account.create({
        data: {
          name,
          balance: parseFloat(balance || '0'),
          description: description || '',
        },
      });
      return NextResponse.json({ success: true, account });
    }

    // Default: donation
    const { donorName, donorEmail, amount, purpose, paymentMethod, status } = body;
    const donation = await prisma.donation.create({
      data: {
        donorName: donorName || 'Anonymous Giver',
        donorEmail: donorEmail || null,
        amount: parseFloat(amount || '0'),
        purpose: purpose || 'TITHE',
        paymentMethod: paymentMethod || 'CASH',
        status: status || 'COMPLETED',
      },
    });
    return NextResponse.json({ success: true, donation });
  } catch (err: any) {
    console.error('[ADMIN/FINANCE/POST] Error:', err);
    return NextResponse.json({ error: err?.message || 'Database error occurred while creating record' }, { status: 500 });
  }
}

