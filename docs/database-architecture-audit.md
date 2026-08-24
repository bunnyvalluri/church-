# Kingdom of Christ Ministries (KCM) — Database Architecture Audit

**Audit Date**: August 2026  
**Auditor**: Principal Database Architect & Distributed Systems Engineering Team  
**Scope**: Full Stack Monorepo (`frontend/` Next.js 14, `backend/` Express Companion Server, PostgreSQL/Neon, Firebase, Cloudinary, Redis/BullMQ)

---

## 1. Executive Summary & Inventory

The Kingdom of Christ Ministries platform operates as an enterprise-grade church management and community engagement portal. The current data layer is centered on **Neon PostgreSQL** accessed via Prisma ORM for relational and transactional consistency, supplemented by **Firebase** (Admin SDK & Client SDK) for client authentication token verification and FCM push notifications, and **Cloudinary** for rich digital media asset storage and transformations.

This audit establishes the baseline before introducing **MongoDB Atlas** as a high-throughput, non-relational event and document repository.

---

## 2. Component-by-Component Architectural Audit

### 2.1 Frontend Architecture
- **Framework**: Next.js 14.2 (App Router with dynamic server routes and static pages).
- **Language**: TypeScript 5.4.
- **State Management**: TanStack React Query (`@tanstack/react-query` v5.101), SWR (`swr` v2.4), React Context.
- **Styling**: Tailwind CSS with custom church design tokens, Framer Motion for rich animations.
- **Authentication**:
  - Google Identity Services (GIS) / OAuth 2.0 with official GIS button and credential callbacks.
  - Firebase Client SDK (`frontend/lib/firebase.ts`) with local persistence and FCM token generation.
  - Next.js Server-side Middleware (`frontend/lib/authMiddleware.ts`) verifying Firebase ID tokens via `firebase-admin` and mapping them to PostgreSQL `User` records with role-based access control.

### 2.2 Backend Companion Architecture
- **Framework**: Express 5.2 on Node.js.
- **Processes**:
  - `PROCESS_TYPE=all`: Unified companion server (Socket.io + HTTP API + BullMQ worker).
  - `PROCESS_TYPE=api`: Dedicated HTTP API with Redis Emitter (`@socket.io/redis-emitter`).
  - `PROCESS_TYPE=socket`: Dedicated WebSocket server with Redis Adapter (`@socket.io/redis-adapter`).
  - `PROCESS_TYPE=worker`: Dedicated background queue processor (`bullmq` + `ioredis`).
- **Telemetry & Loops**: Loop Engineering Architecture (`backend/src/loops/`) running background loops for security audits, sermon automation, upload verification, deployment health, and database audits.
- **Metrics**: Prometheus instrumentation (`backend/src/metrics.js`) exposing `/metrics` for Grafana scraping.

### 2.3 Database Layer (PostgreSQL / Neon)
- **Engine**: PostgreSQL 15+ hosted on Neon / RDS / CNPG.
- **ORM / Query Layer**: Prisma Client (`@prisma/client` v5.11.0), outputting generated types to `frontend/prisma/generated/client` and `backend/prisma/generated/client`.
- **Client Resilience**: Custom Prisma Proxy (`frontend/lib/prisma.ts`) with `DB_OFFLINE` toggle for isolated dev mode, connection pool protection, and automatic process exit cleanup.

---

## 3. Existing PostgreSQL Models Catalog

The current Prisma schema defines 50+ models organized across church business domains:

### Identity & Access Control
- `User` (`members` table): Member profile, contact info, hashed credentials, role enum (`SUPER_ADMIN`, `ADMIN`, `PASTOR`, `MEMBER`, `EVENT_MANAGER`, `FIELD_VOLUNTEER`, `NGO_ADMIN`, `BRANCH_MANAGER`, `MEDIA_TEAM`).
- `DeviceToken` (`device_tokens`): FCM tokens for multi-device push delivery.
- `AuditLog` (`audit_logs`): Legacy relational audit trail.

### Events & Attendance
- `Event`: Church events, dates, venue, registration limits, speaker, banner, priority, color theme, visibility.
- `EventCategory`: Categories (Worship, Youth, Conference, Outreach).
- `EventMedia`, `EventImage`, `EventVideo`: Media attachments linked to Cloudinary.
- `EventRegistration`: Member event signups, attendance status, attendee count.
- `EventAttendance`: Check-in records with timestamp and check-in admin ID.
- `EventNotification`: Dispatched notification metadata per event.
- `EventReport`, `MediaReport`: Post-event administrative reports and photo metrics.

### Sermons & Media
- `Sermon`: Audio/video metadata, scripture references, sermon notes, views, likes, downloads.
- `SermonMedia`, `SermonAudio`, `SermonNotes`: Formatted content and Cloudinary assets.
- `SermonView`, `SermonLike`, `SermonComment`, `SermonBookmark`, `SermonDownload`: Member engagement metrics.

### Giving, Finance & Donations
- `Donation`: Transaction records, amounts, currency (INR, USD), payment status, donor info, payment method.
- `PaymentTransaction`: Gateway references (Razorpay order ID, payment ID, signature).
- `Receipt`: Generated PDF receipt URLs, 80G tax exemption numbers, timestamps.
- `DonationPurpose`, `DonationAmount`, `DonationFormField`: Dynamic donation form configurations.
- `DonationSession`: Active multi-step checkout session tracking.
- `PaymentWebhook`: Gateway webhook receipt and verification logs.
- `Pledge`, `Transaction`, `Account`: Multi-fund accounting and pledges.
- `DonationAgentEvent`, `DonationRetryJob`: State machine audit logs and retry queue jobs.

### Ministries, Community & Pastoral Care
- `PrayerRequest`: Member prayer submissions, categories (Health, Family, Financial, Spiritual), status (Pending, Praying, Answered).
- `Pastor`: Pastor profiles, designations, bio, contact, sprite assets.
- `Ministry`: Ministry groups (Youth, Women, Men, Music, Outreach).
- `Branch`: Multi-campus branch records (Shapur Nagar, Subhash Nagar, Bahadurpally).
- `Family`: Family tree and household groupings.
- `SmallGroup`, `Volunteer`: Small group fellowships and volunteer rosters.
- `ChurchFeedback`, `Testimonial`, `ContactMessage`: Feedback forms and public testimonies.
- `ChurchService`: Weekly service schedules and timings.

### Internet Intelligence & Scraped Content
- `AgentReachTask`, `AgentReachSource`: AI research task outputs.
- `ChurchNewsArticle`, `ChurchNewsItem`: Curated news articles.
- `FirecrawlScrapeJob`, `SermonResearchSummary`, `BibleStudyResource`, `NgoOpportunity`: Scraped external resources.
- `WebsiteMonitorTarget`, `WebsiteMonitorLog`: Website uptime and content change tracking.

---

## 4. Existing Firebase Services & Collections

- **Firebase Authentication**: Client-side auth persistence; token generation; verified server-side via `firebase-admin/auth`.
- **Firebase Cloud Messaging (FCM)**: Topic subscriptions (`kcm-events`), individual token multicasting (`sendEachForMulticast`).
- **Firestore**: Configured in client SDK (`frontend/lib/firebase.ts`) with `FIRESTORE_OFFLINE="true"` fallback for optional cloud document sync.

---

## 5. Existing Cloudinary Media Storage

Folder hierarchy managed in `frontend/lib/cloudinary.ts`:
- `church-platform/events`: Event banners, promotional flyers.
- `church-platform/sermons`: Sermon thumbnails, audio recordings.
- `church-platform/ngo`: NGO project images and documentation.
- `church-platform/profiles`: Member and pastoral staff profile pictures.
- `church-platform/announcements`: Bulletins and slide graphics.
- `church-platform/volunteer`: Volunteer badges and verification photos.
- `church-platform/branches/*`: Campus-specific photography.

---

## 6. Audit Verdict & Polyglot Implementation Directives

1. **PostgreSQL Single Source of Truth**: Under no circumstances should MongoDB replace PostgreSQL for relational church entities. Financial totals, member rosters, registrations, and RBAC must originate in PostgreSQL.
2. **MongoDB Addition**: MongoDB Atlas will be integrated to handle non-relational, append-heavy document streams:
   - `activity_logs` (Member and Admin event feeds)
   - `audit_events` (Security and compliance audit history)
   - `notification_events` (Multi-channel dispatch records and history)
   - `system_events` (Telemetry snapshots and domain event broadcasts)
   - `analytics_events` (User interaction and media consumption analytics)
3. **Zero Migration**: No PostgreSQL tables will be deleted or migrated.
4. **Fault Tolerance**: If MongoDB is unreachable, PostgreSQL operations must continue unimpeded. MongoDB failure must degrade non-critical audit/activity logging gracefully without throwing 500 errors to end users.
