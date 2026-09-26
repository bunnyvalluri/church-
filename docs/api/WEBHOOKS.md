# KCM Webhook Ingress Architecture & Security

## 1. Webhook Providers & Endpoints

| Provider | Endpoint | Verification Mechanism | Secret Configuration |
| :--- | :--- | :--- | :--- |
| **Razorpay** | `/api/webhooks/razorpay` | HMAC-SHA256 signature (`X-Razorpay-Signature`) | `RAZORPAY_WEBHOOK_SECRET` |
| **httpSMS** | `/api/webhooks/httpsms` | API Key & Bearer token header | `HTTPSMS_API_KEY` |
| **Resend** | `/api/webhooks/resend` | Svix HMAC Signature (`svix-signature`) | `RESEND_WEBHOOK_SECRET` |

## 2. Ingress Processing Rules
1. **Raw Body Capture**: Signatures are verified against the unparsed raw request buffer before JSON parsing.
2. **Asynchronous Hand-off**: Webhooks acknowledge receipt with `HTTP 200` within 500ms and process heavy downstream tasks (e.g. PDF receipt generation, email dispatch) via background retry queues.
3. **Replay Defense**: `webhookEventId` deduplication prevents re-execution of historical events.
