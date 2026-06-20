import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdminOrDev } from '@/lib/authMiddleware';
import { z } from 'zod';
import sanitizeHtml from 'sanitize-html';

export const dynamic = 'force-dynamic';

const transactionSchema = z.object({
  type: z.enum(['INFLOW', 'OUTFLOW']),
  amount: z.number().positive(),
  category: z.string().min(1).max(256),
  description: z.string().min(1).max(1000),
  account: z.string().min(1).max(256),
  date: z.string().optional().transform((val) => val ? new Date(val) : new Date()),
});

const sanitize = (s: string) =>
  sanitizeHtml(s, {
    allowedTags: [],
    allowedAttributes: {},
    disallowedTagsMode: 'discard',
  });

export async function GET(req: Request) {
  const auth = await requireAdminOrDev(req);
  if (auth instanceof NextResponse) return auth;

  try {
    const transactions = await prisma.transaction.findMany({
      orderBy: { date: 'desc' },
    });
    return NextResponse.json({ success: true, transactions });
  } catch (err: any) {
    console.error('[ADMIN/TRANSACTIONS/GET] Error:', err);
    return NextResponse.json(
      { error: err?.message || 'Database error occurred' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  const auth = await requireAdminOrDev(req);
  if (auth instanceof NextResponse) return auth;

  try {
    const body = await req.json();
    const parsed = transactionSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid request data', details: parsed.error.format() }, { status: 400 });
    }

    const { type, amount, category, description, account, date } = parsed.data;

    const sanitizedAccount = sanitize(account);
    const sanitizedCategory = sanitize(category);
    const sanitizedDescription = sanitize(description);

    // Run within a Prisma transaction
    const result = await prisma.$transaction(async (tx) => {
      // 1. Fetch the account to check if it exists
      const dbAccount = await tx.account.findUnique({
        where: { name: sanitizedAccount },
      });

      if (!dbAccount) {
        throw new Error(`Account with name '${sanitizedAccount}' not found.`);
      }

      // 2. Calculate new balance
      const balanceAdjustment = type === 'INFLOW' ? amount : -amount;
      const newBalance = dbAccount.balance + balanceAdjustment;

      // 3. Update the Account
      const updatedAccount = await tx.account.update({
        where: { id: dbAccount.id },
        data: { balance: newBalance },
      });

      // 4. Create the Transaction
      const newTransaction = await tx.transaction.create({
        data: {
          type,
          amount,
          category: sanitizedCategory,
          description: sanitizedDescription,
          account: sanitizedAccount,
          date,
        },
      });

      return { transaction: newTransaction, account: updatedAccount };
    });

    return NextResponse.json({ success: true, ...result });
  } catch (err: any) {
    console.error('[ADMIN/TRANSACTIONS/POST] Error:', err);
    return NextResponse.json(
      { error: err?.message || 'Database error occurred while logging transaction' },
      { status: 500 }
    );
  }
}
