# Runbook: Payment Outage & Razorpay Webhook Recovery

## 1. Symptoms & Trigger Conditions
- Alert: `RazorpayWebhookFailure` or `PaymentVerificationFailed`.
- Donations process on payment gateway but donation receipts fail to generate in PostgreSQL.

## 2. Immediate Diagnostic Actions
1. **Check Razorpay Webhook Logs**:
   - In Razorpay Dashboard, check Webhooks status and recent failed deliveries.
2. **Inspect Backend Webhook Route**:
   ```bash
   kubectl logs -n kcm-system -l app=kcm-backend-api --tail=100 | grep razorpay
   ```
3. **Verify Webhook HMAC Secret**:
   - Ensure `RAZORPAY_WEBHOOK_SECRET` matches Razorpay configuration.

## 3. Containment & Remediation
- **Scenario A: Razorpay Webhook Signature Mismatch**:
  Verify raw body parser preserves un-tampered webhook buffer for HMAC SHA256 computation.
- **Scenario B: Webhook Delivery Backlog**:
  Replay un-processed events from Razorpay Webhook Dashboard. The backend's idempotent nonce guard prevents duplicate inserts.

## 4. Verification
- Execute test payment flow in Test Mode and confirm receipt creation.
