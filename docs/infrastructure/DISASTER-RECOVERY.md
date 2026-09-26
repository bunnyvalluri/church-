# KCM Portal — Production Disaster Recovery & Business Continuity Plan

## 1. Executive Summary & Recovery Objectives

This document establishes the Disaster Recovery (DR) and Business Continuity protocols for the Kingdom of Christ Ministries (KCM) Church Platform.

### Recovery Objectives Matrix

| Metric | Target | Rationale & Mechanism |
| :--- | :--- | :--- |
| **Recovery Point Objective (RPO)** | **< 1 Hour** | Continuous WAL archiving + Hourly Neon PostgreSQL snapshots + MongoDB Atlas continuous backup + Daily Velero cluster state. |
| **Recovery Time Objective (RTO)** | **< 30 Minutes** | Automated DNS failover, pre-built immutable container images in GHCR, and declarative Kustomize/Helm GitOps sync. |
| **Data Retention Policy** | **30 Days Daily / 1 Year Monthly** | Point-in-time recovery (PITR) for PostgreSQL and S3-compatible encrypted object storage for cold archive. |

---

## 2. Architecture & Data Asset Registry

```
+-----------------------------------------------------------------------------------+
|                        KCM APPLICATION & DATA TIERS                               |
+-----------------------------------------------------------------------------------+
| 1. Primary Relational State    --> Neon PostgreSQL / CloudNativePG (Prisma ORM)  |
| 2. Document & Event Storage    --> MongoDB Atlas (Audit & Activity Logs)          |
| 3. High-Velocity Cache/Queue   --> Redis (BullMQ queues, WebSocket state)         |
| 4. Static Media Assets         --> Cloudinary (Dynamic CDN & Compressed Storage)  |
| 5. Kubernetes Cluster State    --> K8s manifests / Velero cluster snapshots      |
| 6. Public DNS & Edge Routing   --> Vercel / Cloudflare DNS / Envoy Gateway        |
+-----------------------------------------------------------------------------------+
```

---

## 3. Database Disaster Recovery Procedures

### 3.1. PostgreSQL / Neon Recovery
1. **Point-In-Time Restore (PITR)**:
   - Identify failure timestamp $T_{incident}$.
   - In Neon Console or CLI:
     ```bash
     neon branches create --name restore-branch --parent main --timestamp "2026-09-26T12:00:00Z"
     ```
   - Verify table integrity and row counts.
   - Update `DATABASE_URL` connection secret via Kubernetes Secret / Vercel Environment Variables.
2. **CloudNativePG Cluster Recovery (In-Cluster)**:
   - Restore cluster from S3 backup target using standard CNPG `recovery` specification:
     ```yaml
     apiVersion: postgresql.cnpg.io/v1
     kind: Cluster
     metadata:
       name: kcm-db-recovered
     spec:
       bootstrap:
         recovery:
           source: kcm-cluster-backup
     ```

### 3.2. MongoDB Atlas Recovery
- Trigger Point-In-Time Restore from Atlas Console or CLI for `kcm_documents` cluster.
- Rotate database credentials if incident involved credential compromise.

### 3.3. Redis State Recovery
- Redis holds transient cache, rate-limiting counters, and active BullMQ jobs.
- Upon node/pod recreation, Redis starts clean or loads `dump.rdb`.
- OODA loops automatically reconcile pending database records into queues upon restart.

---

## 4. Application Infrastructure Redeployment

### 4.1. Edge Redeployment (Vercel / Next.js)
```bash
# Redeploy latest verified production release instantly
vercel deploy --prod --prebuilt
```

### 4.2. Kubernetes Cluster Redeployment
```bash
# Apply full namespace and kustomized infrastructure
kubectl apply -k k8s/

# Verify rollout status
kubectl rollout status deployment/kcm-frontend -n kcm-system
kubectl rollout status deployment/kcm-backend-api -n kcm-system
```

---

## 5. Secret Recovery & Key Rotation Protocol

In the event of a suspected security leak:
1. **Neon / PostgreSQL**: Reset role password and update `DATABASE_URL`.
2. **NextAuth Secret**: Generate new 32-character random string (`openssl rand -base64 32`). Active sessions will expire safely, prompting clean re-login.
3. **Razorpay Webhook Secret**: Rotate webhook secret in Razorpay Dashboard and update `RAZORPAY_WEBHOOK_SECRET`.
4. **Cloudinary Secret**: Reissue API Secret in Cloudinary Security settings.
5. **Firebase Service Account**: Revoke old key in Google Cloud Console IAM and upload newly generated JSON private key.

---

## 6. Post-Recovery Verification Checklist

- [ ] HTTP 200 on `/api/health` and `/api/health/ready`
- [ ] Database read/write verified via `/api/events` and `/api/sermons`
- [ ] User login and session creation verified (`/login`)
- [ ] Multilingual translations functional (`/select-language`)
- [ ] WebSocket and realtime notifications operational (`/socket.io`)
- [ ] Razorpay webhook signature verification verified
