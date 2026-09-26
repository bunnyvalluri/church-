# KCM API Idempotency & Replay Protection

## 1. Idempotency Specification
To guarantee that network retries, browser refreshes, or worker redeliveries do not duplicate financial or registration records, state-mutating endpoints support `Idempotency-Key` headers.

```
Client Request (with Idempotency-Key: uuid-v4)
             |
             v
[Check Database / Redis for Key]
   ├── Key Exists & Completed ──> Return Cached Response (HTTP 200)
   ├── Key Exists & Processing ──> Return HTTP 409 (Request In Flight)
   └── Key Not Found           ──> Execute Transaction & Record Key
```

## 2. Protected Scenarios
- **Donation Processing**: Razorpay webhooks deduplicate using `webhookEventId = SHA256(orderId | paymentId)`.
- **Event Registrations**: Unique database constraint `@@unique([userId, eventId])`.
- **Offline Mutations**: `kcm-offline-db` attaches a client UUID to each mutation payload; the server checks if the operation was already committed.
