# KCM Data Retention & Lifecycle Management Policy

## 1. Data Retention Schedule

| Data Category | Tables / Models | Retention Period | Action at Expiry | Rationale |
| :--- | :--- | :--- | :--- | :--- |
| **Financial Records** | `donations`, `receipts`, `payment_webhooks` | **Permanent (7+ Years)** | None (Immutable) | Indian 80G Tax Compliance & Statutory Audit |
| **User Accounts** | `members` | Active Lifetime | Soft Delete (`isDeleted=true`) | Member continuity and historical giving association |
| **Sessions & Auth Tokens** | `sessions` | **30 Days post-expiry** | Hard Purge (`DELETE`) | Security hygiene and table footprint optimization |
| **Notification Logs** | `notification_logs`, `sms_messages` | **90 Days** | Partition purge / Archive | Delivery audit trail & temporary troubleshooting |
| **Audit & Security Logs** | `audit_logs`, `security_events` | **365 Days** | Cold S3 Storage Archive | Incident review and forensic analysis |
| **AI Chatbot Logs** | `ai_chat_logs` | **60 Days** | Anonymized & Aggregated | Safety moderation and model latency metrics |
| **Offline Sync Cache** | IndexedDB (`kcm-offline-db`) | **30 Days for synced items** | Client-side compaction | Mobile device storage conservation |

## 2. Safe Automated Cleanup Jobs
- **Expired Session Reaper**: Runs daily via backend maintenance cron:
  ```sql
  DELETE FROM sessions WHERE "expiresAt" < NOW() - INTERVAL '30 days';
  ```
- **Webhook Audit Trimming**: Retains `payment_webhooks` older than 180 days in compressed archive cold storage.
