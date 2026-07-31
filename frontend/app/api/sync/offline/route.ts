import { NextRequest, NextResponse } from 'next/server';

const processedNonceSet = new Set<string>();

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const batch = body.batch || [];

    const processedNonces: string[] = [];

    for (const record of batch) {
      const { id: nonce, type, payload } = record;

      if (processedNonceSet.has(nonce)) {
        processedNonces.push(nonce);
        continue;
      }

      // Reconcile record
      processedNonceSet.add(nonce);
      processedNonces.push(nonce);
    }

    return NextResponse.json({
      success: true,
      processedNonces,
      count: processedNonces.length,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Offline Sync Reconciliation Failed', details: error?.message },
      { status: 500 }
    );
  }
}
