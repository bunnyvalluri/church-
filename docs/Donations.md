# Online Giving, Offerings & Dynamic UPI QR System

## Purpose
This document provides the technical specification for the online giving subsystem, covering tithe and offering collections, multi-currency processing (Razorpay & Stripe), dynamic UPI QR code generation, live session polling, and automated 80G tax receipt delivery across the Kingdom of Christ Ministries platform.

## Scope
Covers `/give`, `/give/receipt/[donationId]`, payment session APIs (`/api/donations/*`), payment webhook listeners (`/api/payments/webhook`), and receipt generators.

## Status
> Status: Implemented

---

## 1. Donation Architecture & Payment Flow

```mermaid
graph TD
    Donor[Donor / Member] --> GivePage[/give Page]
    
    subgraph Payment Modality Selection
        GivePage --> UPI[Dynamic UPI QR Code: PhonePe, GPay, Paytm]
        GivePage --> RazorpayGate[Razorpay Gateway: Cards, NetBanking, UPI Intent (INR)]
        GivePage --> StripeGate[Stripe Gateway: Global Debit/Credit Cards (USD)]
    end

    subgraph Dynamic UPI QR Pipeline
        UPI --> QRGenAPI[/api/donations/generate-qr]
        QRGenAPI --> InitSession[Initialize DonationSession with UUID]
        QRGenAPI --> BuildUPIString[Build RFC UPI String: upi://pay?pa=...&pn=KCM&am=...&tr=UUID]
        BuildUPIString --> RenderQR[Render Dynamic PNG QR Code]
        RenderQR --> PollSession[Client Long-Polls /api/donations/live-status/sessionId]
    end

    subgraph Automated Fulfillment & Receipting
        RazorpayGate --> Webhook[/api/payments/webhook]
        StripeGate --> Webhook
        PollSession --> Complete[Payment Verified]
        Webhook --> Complete
        
        Complete --> SaveDB[Persist in PostgreSQL donations table]
        SaveDB --> GenReceipt[Generate Signed 80G PDF Receipt]
        GenReceipt --> EmailReceipt[Email PDF Attachment to Donor via Resend]
        EmailReceipt --> ReceiptPage[Redirect to /give/receipt/donationId]
    end
```

---

## 2. Dynamic UPI QR Generation (`/api/donations/generate-qr`)

For frictionless giving in India without payment gateway gateway transaction fees:
1. Generates a standard National Payments Corporation of India (NPCI) UPI payment URI:
   `upi://pay?pa=kcmministries@bank&pn=Kingdom%20of%20Christ%20Ministries&am=1000.00&cu=INR&tr=SES_9a8b7c6d`
2. Encodes the URI into a high-contrast QR code image using `qrcode` library.
3. Initializes a `DonationSession` in PostgreSQL to track live scanning and payment confirmation.

---

## 3. Multi-Gateway Processing

| Gateway | Supported Currencies | Supported Payment Methods | Webhook Event Handled |
| :--- | :--- | :--- | :--- |
| **Razorpay** | `INR` (₹) | UPI Apps, NetBanking, RuPay, Visa, Mastercard | `payment.captured`, `order.paid` |
| **Stripe** | `USD` ($), `EUR`, `GBP` | Visa, Mastercard, American Express, Apple Pay, Google Pay | `payment_intent.succeeded` |

---

## 4. Associated API Endpoints

- `POST /api/donations/create-order` — Initializes Razorpay/Stripe checkout order.
- `POST /api/donations/generate-qr` — Generates dynamic UPI QR code with session ID.
- `GET /api/donations/live-status/[sessionId]` — Real-time SSE / polling endpoint for UPI status.
- `POST /api/donations/verify` — Verifies client checkout signature.
- `POST /api/payments/webhook` — Secure webhook handler for Razorpay & Stripe.
- `GET /api/donations/receipt/[donationId]` — Retrieves receipt metadata.

---

## 5. Troubleshooting & Diagnostics

| Problem | Cause | Solution |
| :--- | :--- | :--- |
| UPI QR scan says "Merchant Blocked / Limit Exceeded" | Daily UPI limit reached on donor bank account | Donor can switch to NetBanking or Debit Card via Razorpay checkout tab. |
| Webhook returns 400 Bad Request | Invalid webhook HMAC signature | Ensure `RAZORPAY_KEY_SECRET` or `STRIPE_WEBHOOK_SECRET` is correctly configured in production environment. |

---

## Security Considerations
- PCI-DSS Compliance: Application servers never capture or persist card CVVs or banking passwords.
- All webhook events require valid HMAC cryptographic signatures.

## Related Documentation
- [Finance.md](Finance.md) — Financial reconciliation and reporting.
- [Database-Architecture.md](Database-Architecture.md) — PostgreSQL donation models.
- [Environment-Variables.md](Environment-Variables.md) — Payment gateway credentials.
