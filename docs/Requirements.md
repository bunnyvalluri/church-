# System Requirements Specification

## Purpose
This document defines the functional, non-functional, security, operational, and regulatory compliance requirements for the Kingdom of Christ Ministries (KCM Church) production platform.

## Scope
Encompasses the web application, mobile progressive web app (PWA), backend APIs, database management systems, AI services, and Kubernetes cloud infrastructure.

## Status
> Status: Implemented

---

## 1. Functional Requirements Matrix

| ID | Module / Feature Area | Requirement Description | Implementation Status | Verification Method |
| :--- | :--- | :--- | :--- | :--- |
| **FR-01** | **User Authentication** | Support credentials registration, bcrypt authentication, Google OAuth 2.0 Identity Services, and session cookies. | `Implemented` | Playwright Auth E2E tests (`tests/e2e/rbac-matrix.spec.ts`) |
| **FR-02** | **Role-Based Access Control** | Enforce authorization boundaries across MEMBER, PASTOR, ADMIN, EVENT_MANAGER, and VOLUNTEER roles. | `Implemented` | RBAC test suite & Next.js middleware enforcement |
| **FR-03** | **Event Management** | Allow creation, editing, publishing, capacity limits, banner uploads, registration tracking, and check-in QR codes. | `Implemented` | API tests (`/api/events/*`) & Event Manager portal |
| **FR-04** | **Online Giving & Tithes** | Process payments via Razorpay (INR) and Stripe (USD), generate dynamic UPI QRs, and issue automated signed PDF receipts. | `Implemented` | Payment webhook verification & receipt generation tests |
| **FR-05** | **Prayer Request System** | Allow members to submit public or confidential prayer requests with pastoral updates and notification feedback. | `Implemented` | Prayer API endpoints & Pastor portal management UI |
| **FR-06** | **Sermon Catalog & Media** | Support sermon video/audio playback, sermon notes, speaker filtering, and Pinecone vector semantic search. | `Implemented` | Sermon library UI & AI embedding indexing pipelines |
| **FR-07** | **NGO Platform** | Showcase community outreach projects, medical camps, volunteer signups, and dedicated NGO media gallery. | `Implemented` | NGO routes (`/ngo/*`) & project APIs |
| **FR-08** | **AI Ministry Orchestration** | Provide OpenClaw AI assistant for sermon research, event promo copywriting, and Bible study summarization. | `Implemented` | Backend AI engine & OpenClaw Orchestrator UI |
| **FR-09** | **Communications Hub** | Send automated push notifications (FCM), SMS (httpSMS), WhatsApp messages (Twilio), and emails (Resend). | `Implemented` | Notification dispatcher & webhook listeners |
| **FR-10** | **Offline PWA Capability** | Provide offline access to schedules, cached sermon notes, and queue prayer requests/event forms in IndexedDB for auto-sync. | `Implemented` | Service worker testing & network offline simulation |

---

## 2. Non-Functional Requirements (NFR)

### 2.1 Performance & Core Web Vitals
- **Largest Contentful Paint (LCP)**: <= 2.0 seconds on standard 4G mobile connections.
- **First Input Delay (FID) / Interaction to Next Paint (INP)**: <= 100 milliseconds.
- **Cumulative Layout Shift (CLS)**: <= 0.05 across all desktop and mobile viewports.
- **API Response Latency**: 95th percentile (P95) <= 150ms for read endpoints; P95 <= 350ms for transactional database writes.

### 2.2 Availability, Reliability & Recovery (SLAs / SLOs)
- **Uptime Target (SLO)**: 99.95% availability during church service hours and public hours.
- **Recovery Point Objective (RPO)**: <= 5 minutes for relational financial and member data (Continuous WAL archiving).
- **Recovery Time Objective (RTO)**: <= 30 minutes for full disaster recovery restoration via Velero and CloudNativePG.

### 2.3 Scalability & Concurrency
- **Frontend Pods**: Horizontal Pod Autoscaling (HPA) configured to scale between 2 and 10 replicas based on CPU (70%) and Memory (80%) thresholds.
- **Database Connection Pooling**: PgBouncer layer with a maximum pool size of 200 concurrent active connections to prevent connection exhaustion.
- **WebSocket Scaling**: Redis Pub/Sub adapter supporting up to 10,000 concurrent active socket connections.

### 2.4 Browser & Device Compatibility
- Full compatibility with modern desktop browsers: Google Chrome, Mozilla Firefox, Apple Safari, Microsoft Edge.
- Full compatibility with mobile browsers: Mobile Safari (iOS 15+), Chrome for Android, Samsung Internet (v18+).
- Support for PWA standalone installation mode across iOS and Android devices.

---

## 3. Security & Compliance Requirements

1. **Transport Encryption**: Enforce TLS 1.3 across all public endpoints with HTTP Strict Transport Security (HSTS) preload headers.
2. **Authentication Security**:
   - User credentials hashed using bcrypt with minimum 12 salt rounds.
   - HttpOnly, Secure, SameSite=Lax session cookies.
   - Brute-force protection via IP-based and user-based rate limiting (100 req / 15 min).
3. **Data Protection & Privacy**:
   - Strict separation of public and private member records.
   - Sensitive financial transaction tokens sanitized before persistent logging.
   - Right-to-be-forgotten deletion workflows for member data.
4. **Runtime & Infrastructure Hardening**:
   - Zero-trust Kubernetes NetworkPolicies isolating database and cache pods from direct external traffic.
   - Non-root container execution (`runAsNonRoot: true`, `readOnlyRootFilesystem: true`).
   - Real-time kernel syscall anomaly detection via Falco.

---

## Security Considerations
All requirements have been mapped to automated integration and security scanning gates in GitHub Actions (`.github/workflows/*`).

## Related Documentation
- [Technology-Stack.md](Technology-Stack.md) — Languages and libraries fulfilling these requirements.
- [Security.md](Security.md) — Comprehensive security architecture.
- [Testing.md](Testing.md) — Quality assurance and verification methodology.
