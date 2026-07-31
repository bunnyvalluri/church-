# LOOP.md — Loop Engineering Architecture Specification
## Kingdom of Christ Ministries (KCM) Church Platform

> **Loop-Engineering Paradigm**: Autonomous, continuous-loop architecture built on OODA (Observe-Orient-Decide-Act) control loops to automate engineering workflows, security auditing, multi-branch compliance, deployment pipelines, notification dispatches, offline synchronization, and donation processing.

---

## 1. System Invariants & Architectural Directives

1. **State Reconciliation**: State is continuously reconciled toward target state invariants. Unhandled state drift automatically triggers corrective worker actions or dead-letter queues.
2. **Idempotency Guarantee**: Every loop mutation operation MUST include a unique idempotency nonce or payment transaction key (`uuid-v4` or Razorpay `payment_id`). Duplicate payloads are rejected before database execution.
3. **Dead-Letter Routing (DLQ)**: Jobs failing after maximum retry attempts (exponential backoff with random jitter) MUST be persisted to the Dead-Letter Queue and logged in `AuditLog`.
4. **Telemetry & Audit Visibility**: Every loop step records execution time, retry count, and status into `STATE.md` and PostgreSQL audit tables.

---

## 2. Master OODA Loop Registry

```
+-----------------------------------------------------------------------------------+
|                                 LOOP ENGINE CORE                                  |
|                                                                                   |
|  +------------------+     +------------------+     +------------------+           |
|  |    OBSERVE       | --> |      ORIENT      | --> |      DECIDE      |           |
|  |  (Queue/Cron/    |     | (Security/RBAC/  |     | (Strategy/Retry/ |           |
|  |   Sockets/HTTP)  |     |   Signatures)    |     |   DLQ Routing)   |           |
|  +------------------+     +------------------+     +------------------+           |
|                                                              |                    |
|                                                              v                    |
|                                                    +------------------+           |
|                                                    |       ACT        |           |
|                                                    | (DB/Cloudinary/  |           |
|                                                    | Revalidate/Push) |           |
|                                                    +------------------+           |
+-----------------------------------------------------------------------------------+
```

---

## 3. The 7 Automated Control Loops

### Loop 1: Event Upload Loop
- **Observe**: Ingests new event or media upload requests via Admin API or background upload queue (`eventUploadQueue`).
- **Orient**: Validates image dimensions, file size (< 15MB), and MIME magic bytes (`image/jpeg`, `image/png`, `image/webp`).
- **Decide**: Determines optimization strategy (Cloudinary dynamic transformation vs compressed WebP conversion).
- **Act**:
  1. Uploads media to Cloudinary with compression.
  2. Persists metadata to PostgreSQL `Event` & `EventMedia` tables via Prisma.
  3. Triggers Next.js On-Demand Cache Revalidation (`revalidatePath('/')`).
  4. Emits real-time Socket.io event (`event:new`) for live browser popup alerts.
  5. Sends Firebase FCM Push Notification to registered mobile/web subscriber tokens.
- **Fail-Safe**: If Cloudinary upload fails, image falls back to local storage buffer and enters exponential retry queue.

---

### Loop 2: Security Loop
- **Observe**: Scans incoming HTTP requests, API authentication headers, and periodic cron scanner (every 5 minutes).
- **Orient**:
  1. Validates **NextAuth JWT** signature and token expiration.
  2. Evaluates **RBAC permissions** (`SUPER_ADMIN`, `ADMIN`, `BRANCH_LEADER`, `MEMBER`).
  3. Sanitizes file upload payloads using `sanitize-html` and MIME header inspection.
  4. Evaluates request velocity against rate limits (max 100 req/min per IP; max 5 failed auth attempts/5 min).
- **Decide**: Flag anomalies (token spoofing, privilege escalation, payload injection, brute force).
- **Act**:
  1. Rejects invalid requests with standard `401 Unauthorized` / `403 Forbidden`.
  2. Writes security alert entry to `AuditLog` in PostgreSQL.
  3. Updates threat level indicators in `STATE.md`.

---

### Loop 3: Branch Monitoring Loop
- **Branch Scope**: **Shapur Nagar**, **Subhash Nagar**, **Bahadurpally**.
- **Observe**: Scheduled cron runner evaluates branch metrics every 6 hours.
- **Orient**:
  1. Audits missing weekly/monthly financial & ministry reports per branch.
  2. Identifies pending media uploads (recorded sermons, event posters).
  3. Detects incomplete attendance rosters from Sunday services.
- **Decide**: Computes Branch Health Score (0–100%). Scores < 80% trigger escalation reminders.
- **Act**:
  1. Generates targeted reminders via Socket.io & FCM push to branch pastors and administrators.
  2. Updates branch compliance matrix in `STATE.md`.

---

### Loop 4: Deployment Loop
- **Observe**: Triggered on GitHub `push` to `main` or manual workflow dispatch.
- **Orient**:
  1. Executes suite of automated unit/integration tests (`npm test`).
  2. Compiles Next.js production build (`next build`).
  3. Runs **Lighthouse CI Audit** verifying Performance $\ge 85$, Accessibility $\ge 90$, SEO $\ge 90$.
  4. Scans dependencies for security vulnerabilities (`npm audit`).
- **Decide**: All checks must pass with zero critical vulnerabilities.
- **Act**:
  1. Deploys application to **Vercel** production environment.
  2. On deployment failure or audit regression, triggers automated rollback and dispatches alert webhook to engineers.

---

### Loop 5: Notification Loop
- **Observe**: Listens to `notificationQueue` for broadcast and direct user message dispatches.
- **Orient**: Resolves target channels (Active Socket.io web connections vs Offline FCM tokens).
- **Decide**: Routes payload across dual dispatch channels.
- **Act**:
  1. Emits real-time Socket.io message to active client rooms.
  2. Dispatches Firebase FCM push notifications using `firebase-admin`.
  3. Logs delivery receipt in `NotificationLog` table.
- **Retry Mechanism**: Exponential backoff (initial delay: 5s, backoff factor: 2x, jitter: random 0-1s, max attempts: 5). Failed notifications route to DLQ.

---

### Loop 6: Offline Sync Loop
- **Observe**: Client-side network listener detects browser `online` state and reads pending draft transactions from **IndexedDB** (`kcm_offline_store`).
- **Orient**: Validates payload structure, client timestamps, and idempotency nonces (`uuid-v4`).
- **Decide**: Checks server-side transaction registry for duplicate nonces to prevent replay attacks.
- **Act**:
  1. Posts batch sync to `/api/sync/offline`.
  2. Inserts new attendance records, offline donations, and event registrations into PostgreSQL.
  3. Resolves data conflicts (Server timestamp authority).
  4. Returns sync confirmation, allowing client to flush IndexedDB queue.

---

### Loop 7: Donation Loop
- **Observe**: Receives Razorpay HTTP Webhook notifications (`payment.captured`, `order.paid`).
- **Orient**:
  1. Computes and verifies **HMAC SHA256** webhook signature using `RAZORPAY_WEBHOOK_SECRET`.
  2. Inspects `Donation` database table to ensure `razorpay_payment_id` has not been processed previously.
- **Decide**: Authenticate payload authenticity and transaction uniqueness.
- **Act**:
  1. Commits donation record to PostgreSQL.
  2. Generates tax-deductible PDF receipt entry in `Receipt` table.
  3. Emits Socket.io event updating live donation goal counters on the website.
  4. Dispatches email receipt via Resend / NodeMailer.

---

## 4. Queue Configurations & Exponential Backoff Matrix

| Queue Name | Concurrency | Max Attempts | Initial Backoff | Max Backoff | Jitter |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `eventUploadQueue` | 3 | 3 | 5,000 ms | 60,000 ms | Enabled |
| `securityAuditQueue` | 10 | 5 | 1,000 ms | 15,000 ms | Enabled |
| `branchAuditQueue` | 2 | 3 | 10,000 ms | 120,000 ms | Enabled |
| `notificationQueue` | 15 | 5 | 2,000 ms | 30,000 ms | Enabled |
| `offlineSyncQueue` | 5 | 4 | 3,000 ms | 45,000 ms | Enabled |
| `donationQueue` | 5 | 5 | 2,000 ms | 60,000 ms | Enabled |

---

## 5. Telemetry & Metrics Output

Loop engine exposes Prometheus metrics at `/metrics`:
- `kcm_loop_execution_total{loop_name, status}`
- `kcm_loop_duration_seconds{loop_name}`
- `kcm_queue_active_jobs{queue_name}`
- `kcm_queue_failed_jobs{queue_name}`
- `kcm_branch_compliance_score{branch_id}`
