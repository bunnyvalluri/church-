# Transactional Email System Specification

## Overview
The Kingdom of Christ Ministries (KCM) transactional email system handles mission-critical delivery across authentication, password resets, 80G tax receipt notifications, and pastoral alerts.

---

## 1. Supported Workflows

| Trigger / Event | Template | Dispatch Strategy | Recipient |
| :--- | :--- | :--- | :--- |
| **New User Registration** | Welcome & Account Confirmation | Resend Primary / Nodemailer Fallback | Member |
| **Password Reset** | Secure Reset Token Link | High Priority Direct Dispatch | Member / Admin |
| **Security Login Alert** | Unrecognized Device / IP Notice | Background Event Dispatch | Member / Admin |
| **80G Donation Receipt** | Verified Tax-Exempt PDF Receipt Link | Atomic with Webhook Processing | Donor |
| **Prayer Request** | Pastoral Team Notification | Batched Async Queue | Pastors |

---

## 2. Security & Deliverability Controls

1. **Delivery State Tracking**:
   - `PENDING` → `SENDING` → `SENT` → `DELIVERED` / `FAILED`
   - Messages are never marked as `SENT` unless the provider returns an authoritative transaction ID.
2. **Deterministic Idempotency**:
   - Webhook & event triggers use `SHA-256(recipient + template + transactionId)` keys to prevent duplicate email spam.
3. **Secret Isolation**:
   - Resend API keys (`RESEND_API_KEY`) and SMTP credentials (`SMTP_PASSWORD`) are loaded strictly from server environment variables and never exposed to the client.
