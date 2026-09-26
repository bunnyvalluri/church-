# KCM Database Transactions & Concurrency Architecture

## 1. Transaction Boundaries
To eliminate race conditions, partial updates, and orphaned financial state, critical multi-step operations use Prisma interactive transactions (`prisma.$transaction`):

### 1.1 Payment Webhook & Donation Verification
```typescript
await prisma.$transaction(async (tx) => {
  // 1. Idempotency Check: record incoming webhook
  const webhookRecord = await tx.paymentWebhook.create({
    data: {
      webhookEventId: idempotencyKey,
      payload: rawPayload,
      status: 'PROCESSING',
    },
  });

  // 2. Transition Donation to COMPLETED
  const updatedDonation = await tx.donation.update({
    where: { id: donationId },
    data: {
      status: 'COMPLETED',
      amountVerified: true,
      signatureVerified: true,
      verifiedBy: 'WEBHOOK',
      razorpayPaymentId: paymentId,
    },
  });

  // 3. Issue Unique 80G Tax Receipt
  const receipt = await tx.receipt.create({
    data: {
      receiptNumber: generateReceiptNumber(),
      donationId: updatedDonation.id,
      amount: updatedDonation.amount,
      verificationCode: generateVerificationCode(),
    },
  });

  // 4. Mark Webhook as PROCESSED
  await tx.paymentWebhook.update({
    where: { id: webhookRecord.id },
    data: { status: 'PROCESSED', processedAt: new Date() },
  });
});
```

### 1.2 Event Registration & Capacity Management
- **Atomic Seat Decrement**: Remaining seats on `Event` are checked and decremented atomically within a transaction.
- **Unique Constraint Guard**: Composite index `@@unique([userId, eventId])` on `EventRegistration` guarantees double-click submissions cannot create duplicate registrations.

## 2. Deadlock Prevention & Isolation Levels
- **Consistent Lock Ordering**: All transactions acquiring multi-table locks touch entities in alphabetical/hierarchical order (`User` -> `Event` -> `Registration` -> `Attendance`).
- **Short Transaction Life**: External network calls (e.g. Razorpay API, SMTP mailers) are NEVER executed inside the database transaction boundary.
