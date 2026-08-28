# Architecture & Operational Workflow Diagrams

## Purpose
This document provides visual Mermaid architectural, operational, and sequence diagrams illustrating key data flows, authentication cycles, administrative interactions, infrastructure topologies, and disaster recovery processes across the Kingdom of Christ Ministries platform.

## Scope
Covers all functional workflows, database flows, infrastructure pipelines, and user journeys implemented in the repository.

## Status
> Status: Implemented

---

## 1. Overall System Architecture Topology

```mermaid
graph TB
    subgraph Clients
        Web[Web Browsers]
        Mobile[Mobile PWA / Mobile Safari / Chrome]
        APIClient[Automated Clients / External Webhooks]
    end

    subgraph Edge & Security Layer
        DNS[DNS / Cloudflare] --> Gateway[Envoy Gateway / HTTPRoutes]
        Gateway --> AuthFilter[JWT / Session Verification Policy]
        Gateway --> RateLimiter[Envoy Rate Limit Service]
    end

    Clients --> DNS

    subgraph Compute Tier
        AuthFilter --> NextFrontend[Next.js 14 Frontend Pods]
        AuthFilter --> ExpressBackend[Express & Socket.io Pods]
        ExpressBackend --> BullMQWorker[BullMQ Background Worker Pods]
    end

    subgraph Data & Storage Tier
        NextFrontend -->|Prisma Pool| PG[(PostgreSQL HA Cluster - CloudNativePG)]
        NextFrontend -->|Async Writes| Mongo[(MongoDB Atlas Telemetry)]
        NextFrontend -->|Media Storage| Cloudinary[(Cloudinary Media CDN)]
        
        ExpressBackend -->|Prisma Client| PG
        ExpressBackend -->|Telemetry| Mongo
        ExpressBackend -->|Pub/Sub & Cache| Redis[(Redis Cluster)]
        ExpressBackend -->|Event Streaming| Kafka[(Apache Kafka Cluster)]
        ExpressBackend -->|JetStream| NATS[(NATS JetStream)]
    end

    subgraph Observability & Storage Subsystems
        Longhorn[(Longhorn Distributed Block Storage)] --> PG
        Longhorn --> Redis
        Prometheus[Prometheus Operator] --> NextFrontend
        Prometheus --> ExpressBackend
        Prometheus --> PG
        Loki[Grafana Loki] --> Grafana[Grafana Dashboards]
        Prometheus --> Grafana
        Velero[Velero Backup Operator] --> S3Target[(S3 / Object Storage Target)]
    end
```

---

## 2. Universal Request Flow

```mermaid
sequenceDiagram
    autonumber
    actor Client as User / Browser
    participant Gateway as Envoy Gateway
    participant NextJS as Next.js 14 Server
    participant DB as PostgreSQL (CloudNativePG)
    participant Mongo as MongoDB Atlas
    participant Cloudinary as Cloudinary CDN

    Client->>Gateway: HTTPS Request (e.g. GET /events or POST /api/donations)
    Gateway->>Gateway: Apply Rate Limiting & TLS Termination
    Gateway->>NextJS: Forward HTTP Request with X-Forwarded Headers
    
    alt Static or Public SSR Request
        NextJS->>DB: Query Event / Sermon metadata (Prisma)
        DB-->>NextJS: Return Relational Records
        NextJS-->>Client: Rendered HTML + Hydration JS
    else API Mutation Request
        NextJS->>NextJS: Verify Session / Authorization Token
        NextJS->>DB: Execute Transactional Mutation
        DB-->>NextJS: Commit Success
        NextJS->>Mongo: Asynchronously Log Audit Event
        NextJS-->>Client: JSON Response (200 OK / 201 Created)
    end
```

---

## 3. Authentication & Registration Flows

### 3.1 Standard Credentials Registration Flow

```mermaid
sequenceDiagram
    autonumber
    actor User as New Member
    participant Form as Register Page (app/register/page.tsx)
    participant AuthAPI as Next.js API (/api/auth/register)
    participant DB as PostgreSQL (Prisma Client)
    participant Hash as Bcrypt Hasher
    participant Audit as MongoDB Audit Repository

    User->>Form: Fill Name, Email, Password, Phone, Address
    Form->>Form: Client-side Zod validation
    Form->>AuthAPI: POST { name, email, password, phone, role: "MEMBER" }
    AuthAPI->>DB: Check if user exists (findUnique email)
    alt Email already registered
        DB-->>AuthAPI: Existing User Record
        AuthAPI-->>Form: 400 Bad Request ("Email already registered")
        Form-->>User: Display error message
    else User is new
        AuthAPI->>Hash: Hash password with salt rounds (12)
        Hash-->>AuthAPI: hashedPassword
        AuthAPI->>DB: Create User record with role MEMBER
        DB-->>AuthAPI: Created User (id, email, name, role)
        AuthAPI->>Audit: Log USER_REGISTRATION event
        AuthAPI-->>Form: 201 Created { success: true, user }
        Form-->>User: Redirect to /login with success notification
    end
```

### 3.2 Standard Credentials Login Flow

```mermaid
sequenceDiagram
    autonumber
    actor User as Member / Pastor / Admin
    participant Login as Login Page (app/login/page.tsx)
    participant AuthAPI as Next.js API (/api/auth/login)
    participant DB as PostgreSQL (Prisma)
    participant Hash as Bcrypt Compare
    participant Session as Session Token Generator

    User->>Login: Submit Email & Password
    Login->>AuthAPI: POST { email, password }
    AuthAPI->>DB: Query User by email
    alt User Not Found
        DB-->>AuthAPI: null
        AuthAPI-->>Login: 401 Unauthorized ("Invalid credentials")
    else User Found
        AuthAPI->>Hash: Compare plaintext password with hashed password
        alt Password Mismatch
            Hash-->>AuthAPI: false
            AuthAPI-->>Login: 401 Unauthorized ("Invalid credentials")
        else Password Valid
            Hash-->>AuthAPI: true
            AuthAPI->>Session: Generate Encrypted JWT / Session Cookie
            Session-->>AuthAPI: Set-Cookie: kcm_session=...; HttpOnly; Secure; SameSite=Lax
            AuthAPI-->>Login: 200 OK { user: { id, email, role, name } }
            Login->>Login: Route according to role (MEMBER -> /member, PASTOR -> /pastor, ADMIN -> /admin)
        end
    end
```

### 3.3 Google Sign-In Flow

```mermaid
sequenceDiagram
    autonumber
    actor User as End User
    participant Browser as Browser Client
    participant Google as Google OAuth 2.0 / GIS
    participant SyncAPI as Next.js API (/api/auth/sync)
    participant GoogleAuth as google-auth-library
    participant DB as PostgreSQL (Prisma)

    User->>Browser: Click "Sign in with Google"
    Browser->>Google: Authenticate & Authorize Client
    Google-->>Browser: Return Google ID Token (JWT)
    Browser->>SyncAPI: POST { credential, idToken }
    SyncAPI->>GoogleAuth: Verify ID Token signature with Google Certificates
    GoogleAuth-->>SyncAPI: Valid Token Payload (email, name, picture, sub)
    SyncAPI->>DB: Upsert User by email
    DB-->>SyncAPI: Synced User Record
    SyncAPI-->>Browser: 200 OK with Auth Session Cookie
    Browser->>Browser: Redirect to User Portal
```

---

## 4. Role-Specific User Flows

### 4.1 Member Journey Flow

```mermaid
graph TD
    Member([Authenticated Member]) --> MemberDashboard[Member Portal /member]
    MemberDashboard --> Profile[View/Edit Profile & Photo]
    MemberDashboard --> EventReg[Browse & Register for Events]
    MemberDashboard --> SubmitPrayer[Submit Personal Prayer Request]
    MemberDashboard --> GiveOffering[Make Donation & View Receipts]
    MemberDashboard --> Sermons[Stream Sermons & Download Notes]
    MemberDashboard --> Volunteer[Sign up for Ministry Volunteering]
```

### 4.2 Pastor Workflow & AI Orchestration

```mermaid
graph TD
    Pastor([Pastor / Ministry Leader]) --> PastorDashboard[Pastor Portal /pastor]
    PastorDashboard --> SermonManager[Publish/Edit Sermons & Series]
    PastorDashboard --> PrayerManager[Review & Pray for Prayer Requests]
    PastorDashboard --> EventOps[Schedule Ministry & Branch Events]
    PastorDashboard --> MemberDirectory[View Member Roster & Discipleship]
    PastorDashboard --> Reports[View Attendance & Giving Analytics]
    PastorDashboard --> OpenClaw[OpenClaw AI Ministry Assistant]
    
    OpenClaw --> SermonAI[Generate Sermon Outlines & Cross-References]
    OpenClaw --> EventAI[Generate Event Copy & Promotional Posts]
    OpenClaw --> ResearchAI[Conduct Theological & Biblical Research]
```

### 4.3 Admin Control Flow

```mermaid
graph TD
    Admin([System Administrator]) --> AdminPortal[Admin Portal /admin]
    AdminPortal --> UserManagement[Manage Users, Roles & Permissions]
    AdminPortal --> FinancialOversight[Financial Reconciliation & Export]
    AdminPortal --> SystemHealth[Detailed System Health & Service Status]
    AdminPortal --> AuditTrail[Query MongoDB Audit & System Logs]
    AdminPortal --> NotificationBroadcast[Send FCM / SMS / Email Broadcasts]
```

---

## 5. Feature & Subsystem Flows

### 5.1 Event Creation, Registration & Check-In Flow

```mermaid
sequenceDiagram
    autonumber
    actor Admin as Event Manager / Pastor
    participant EventAPI as /api/events
    participant UploadAPI as /api/upload/event-image
    participant Cloudinary as Cloudinary CDN
    participant DB as PostgreSQL
    actor Member as Church Member
    participant CheckInAPI as /api/events/[id]/check-in

    Admin->>UploadAPI: Upload Event Banner / Poster
    UploadAPI->>Cloudinary: Stream Buffer with auto-format & limit
    Cloudinary-->>UploadAPI: secure_url & public_id
    Admin->>EventAPI: POST Event Details (title, date, capacity, bannerUrl)
    EventAPI->>DB: Insert Event record (status: PUBLISHED)
    DB-->>EventAPI: Event Created
    
    Member->>EventAPI: POST /api/events/[id]/register
    EventAPI->>DB: Check remainingSeats > 0 inside transaction
    EventAPI->>DB: Create EventRegistration + Decrement remainingSeats
    DB-->>EventAPI: Registration Confirmed
    EventAPI-->>Member: Return Registration Badge & QR Code
    
    Note over Member,CheckInAPI: On Event Day at Venue
    Member->>CheckInAPI: Scan QR Code at entrance
    CheckInAPI->>DB: Mark EventRegistration status as ATTENDED
    DB-->>CheckInAPI: Check-in verified
```

### 5.2 Prayer Request Pipeline Flow

```mermaid
sequenceDiagram
    autonumber
    actor Member as Church Member
    participant PrayerAPI as /api/member/prayers
    participant DB as PostgreSQL
    actor Pastor as Pastor / Prayer Team
    participant PastorAPI as /api/pastor/prayer-requests

    Member->>PrayerAPI: Submit Prayer Request (title, request, isPrivate)
    PrayerAPI->>DB: Insert PrayerRequest (status: PENDING)
    DB-->>PrayerAPI: Saved Record
    PrayerAPI-->>Member: Confirmation receipt
    
    Pastor->>PastorAPI: Fetch Pending Prayer Requests
    PastorAPI->>DB: Query PrayerRequests where status = PENDING
    DB-->>PastorAPI: Return list
    Pastor->>PastorAPI: Update Request (status: PRAYED / ANSWERED, pastoralNotes)
    PastorAPI->>DB: Update PrayerRequest record
    DB-->>PastorAPI: Success
    PastorAPI-->>Pastor: Status updated & member notified
```

### 5.3 Sermon Streaming & Semantic Search Flow

```mermaid
sequenceDiagram
    autonumber
    actor Member as Listener / Member
    participant SermonUI as Sermons Directory (/sermons)
    participant SearchAPI as Search / Vector Engine
    participant Pinecone as Pinecone Vector DB
    participant DB as PostgreSQL
    participant CDN as Cloudinary / Streaming Host

    Member->>SermonUI: Enter semantic search query (e.g., "overcoming anxiety and fear")
    SermonUI->>SearchAPI: Query Text
    SearchAPI->>SearchAPI: Generate Text Embedding (OpenAI text-embedding-3-small)
    SearchAPI->>Pinecone: Query Vector Index for Nearest Neighbors
    Pinecone-->>SearchAPI: Top Matching Sermon IDs & Cosine Scores
    SearchAPI->>DB: Fetch full Sermon records by IDs
    DB-->>SearchAPI: Sermon Metadata (title, speaker, videoUrl, audioUrl)
    SearchAPI-->>SermonUI: Return Ranked Sermon List
    Member->>SermonUI: Click Play on chosen Sermon
    SermonUI->>CDN: Stream Optimized Audio/Video Stream
```

### 5.4 Donation & Automated Receipting Flow

```mermaid
sequenceDiagram
    autonumber
    actor Donor as Donor / Member
    participant DonateUI as Giving Page (/give)
    participant GatewayAPI as /api/donations/create-order
    participant Razorpay as Razorpay / Stripe Gateway
    participant WebhookAPI as /api/payments/webhook
    participant DB as PostgreSQL
    participant ReceiptService as PDF Receipt Generator
    participant EmailService as Resend Email Delivery

    Donor->>DonateUI: Enter Amount, Purpose (Tithe/Offering/Building), Donor Details
    DonateUI->>GatewayAPI: POST { amount, currency: "INR", purpose }
    GatewayAPI->>Razorpay: Create Order with receipt ID
    Razorpay-->>GatewayAPI: Return order_id & signature requirements
    GatewayAPI-->>DonateUI: Return Razorpay Checkout Modal Config
    
    Donor->>Razorpay: Complete Payment (UPI / NetBanking / Cards)
    Razorpay->>WebhookAPI: POST Webhook Event (payment.captured)
    WebhookAPI->>WebhookAPI: Verify Webhook HMAC Signature
    WebhookAPI->>DB: Insert Donation Record (status: COMPLETED)
    WebhookAPI->>ReceiptService: Generate Signed PDF Tax Receipt
    ReceiptService->>DB: Save Receipt metadata (receiptNumber)
    WebhookAPI->>EmailService: Send Receipt PDF attachment to Donor Email
    EmailService-->>Donor: Delivery Receipt Email
```

---

## 6. Media Management Flow

```mermaid
sequenceDiagram
    autonumber
    actor Admin as Content Creator
    participant UploadRoute as /api/upload/[category]
    participant Cloudinary as Cloudinary API
    participant LoopWorker as Backend Verification Loop
    participant DB as PostgreSQL

    Admin->>UploadRoute: Upload Image / Video File (multipart/form-data)
    UploadRoute->>UploadRoute: Validate mime-type, file size bounds
    UploadRoute->>Cloudinary: upload_stream(buffer, { folder: "church-platform/...", quality: "auto", fetch_format: "auto" })
    Cloudinary-->>UploadRoute: UploadApiResponse (public_id, secure_url, width, height)
    UploadRoute->>DB: Associate URL & public_id with Target Entity
    DB-->>UploadRoute: Transaction Commit
    UploadRoute-->>Admin: 200 OK { url: secure_url }
    
    Note over LoopWorker,Cloudinary: Async Verification Loop (Every 10 min)
    LoopWorker->>DB: Query recent Media records
    LoopWorker->>Cloudinary: Verify asset availability via HEAD check
    alt Asset Missing / Invalid
        LoopWorker->>DB: Flag record status for administrative review
    end
```

---

## 7. Offline-First PWA Synchronization Flow

```mermaid
sequenceDiagram
    autonumber
    actor User as Mobile User (Offline)
    participant SW as Service Worker (sw.js)
    participant IDB as IndexedDB Sync Queue
    participant SyncEngine as lib/offline/sync-queue.ts
    participant ServerAPI as Backend API (/api/sync/offline)
    participant DB as PostgreSQL

    Note over User,SW: Network Disconnected
    User->>SW: Submit Prayer Request / Form
    SW->>IDB: Save operation to offline queue with UUID timestamp
    IDB-->>User: UI displays "Saved locally — Will sync when online"
    
    Note over User,SW: Network Restored (online event)
    SW->>SyncEngine: Trigger sync loop
    SyncEngine->>IDB: Read all pending mutation tasks (FIFO)
    loop For each pending item
        SyncEngine->>ServerAPI: POST /api/sync/offline { action, payload, clientTimestamp }
        ServerAPI->>DB: Process mutation & resolve timestamp conflicts
        DB-->>ServerAPI: Success
        ServerAPI-->>SyncEngine: 200 OK (Server state ack)
        SyncEngine->>IDB: Remove task from IndexedDB
    end
    SyncEngine-->>User: Toast Notification: "All changes synced successfully"
```

---

## 8. Kubernetes Infrastructure & GitOps Flow

```mermaid
sequenceDiagram
    autonumber
    actor Dev as Developer / DevOps Engineer
    participant Git as GitHub Repository (main branch)
    participant Actions as GitHub Actions CI/CD
    participant Registry as GHCR / Container Registry
    participant ArgoCD as Argo CD Controller
    participant Cluster as Production Kubernetes Cluster
    participant Rollout as Argo Rollouts Controller

    Dev->>Git: git push origin main
    Git->>Actions: Trigger CI Pipeline
    Actions->>Actions: Lint, Typecheck, Unit & Playwright Tests
    Actions->>Actions: Trivy Security & Container Image Scan
    Actions->>Registry: Build & Push Multi-arch Docker Image with Git SHA
    Actions->>Git: Commit updated image tag to GitOps manifests
    
    ArgoCD->>Git: Poll & Detect manifest change (GitOps Reconciliation)
    ArgoCD->>Cluster: Apply Updated Kustomize / Helm Manifests
    Cluster->>Rollout: Initialize Progressive Canary Release
    Rollout->>Rollout: Route 20% traffic to Canary Pods
    Rollout->>Rollout: Analyze Prometheus Error Rates & Latency (5 min)
    alt Analysis Healthy
        Rollout->>Cluster: Promote Canary to 100% (Full Rollout)
    else Error Spike Detected
        Rollout->>Cluster: Automatic Instant Rollback to Previous Stable Replica
    end
```

---

## 9. Observability, Logging & Alerting Topology

```mermaid
graph TD
    subgraph Workload Pods
        FrontendPods[Frontend Next.js Pods]
        BackendPods[Backend Express/Socket.io Pods]
        DBPods[CloudNativePG Database Pods]
        RedisPods[Redis Cluster Pods]
    end

    subgraph Metrics Pipeline
        FrontendPods -->|/api/metrics| Prometheus[Prometheus Operator]
        BackendPods -->|/metrics (prom-client)| Prometheus
        DBPods -->|metrics exporter: 9187| Prometheus
        RedisPods -->|redis_exporter: 9121| Prometheus
        Prometheus -->|Evaluates Rules| Alertmanager[Prometheus Alertmanager]
        Alertmanager -->|Critical Alerts| PagerDuty[On-Call Alert / Slack]
    end

    subgraph Log Pipeline
        WorkloadPodsLog[Pod stdout / stderr JSON] --> Fluentbit[Fluentbit / Promtail DaemonSet]
        Fluentbit --> Loki[Grafana Loki Storage]
    end

    subgraph Visualization
        Prometheus --> Grafana[Grafana Visualization]
        Loki --> Grafana
    end
```

---

## 10. Backup & Disaster Recovery Pipeline

```mermaid
sequenceDiagram
    autonumber
    participant VeleroCron as Velero Schedule (Nightly 02:00 UTC)
    participant CNPGBackup as CloudNativePG WAL Archiver
    participant LonghornSnap as Longhorn Snapshotter
    participant S3Storage as Offsite S3 Object Storage

    Note over CNPGBackup,S3Storage: Continuous PostgreSQL WAL Streaming
    CNPGBackup->>S3Storage: Stream WAL archives every 5 minutes

    Note over VeleroCron,S3Storage: Nightly Disaster Recovery Backup
    VeleroCron->>LonghornSnap: Trigger VolumeSnapshots for PVCs
    LonghornSnap->>LonghornSnap: Freeze & snapshot Longhorn block devices
    LonghornSnap->>S3Storage: Upload block delta snapshots
    VeleroCron->>VeleroCron: Export all K8s CRDs, Secrets, ConfigMaps, Namespaces
    VeleroCron->>S3Storage: Upload gzipped cluster state tarball
    VeleroCron-->>VeleroCron: Verify backup integrity & emit metric to Prometheus
```

---

## Security Considerations
All communication links between clients, gateways, pods, and databases are strictly encrypted in transit using TLS 1.3. Internal database connections enforce SSL/TLS with client certificate verification.

## Related Documentation
- [Architecture.md](Architecture.md) — Textual architectural breakdown.
- [CloudNativePG.md](CloudNativePG.md) — Database cluster topology.
- [ArgoRollouts.md](ArgoRollouts.md) — Progressive delivery configuration.
